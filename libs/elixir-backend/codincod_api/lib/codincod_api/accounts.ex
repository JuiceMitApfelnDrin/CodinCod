defmodule CodincodApi.Accounts do
  @moduledoc """
  Accounts context responsible for user management, authentication and preferences.

  This module is the Elixir counterpart for the Node services defined in
  `libs/backend/src/services/user.service.ts` and the login/register routes.
  """

  import Ecto.Query, warn: false
  alias CodincodApi.Repo

  alias CodincodApi.Accounts.{User, UserBan, Preference, Password, PasswordReset, Email}
  alias CodincodApi.Mailer

  @type user_params :: map()

  ## Retrieval -----------------------------------------------------------------

  @spec get_user!(Ecto.UUID.t()) :: User.t()
  def get_user!(id) do
    Repo.get!(User, id)
  end

  @spec get_user(Ecto.UUID.t()) :: User.t() | nil
  def get_user(id), do: Repo.get(User, id)

  @spec get_user_by_username(String.t()) :: User.t() | nil
  def get_user_by_username(username) when is_binary(username) do
    Repo.get_by(User, username: username)
  end

  @spec get_user_with_preferences(Ecto.UUID.t()) :: User.t() | nil
  def get_user_with_preferences(id) do
    User
    |> preload(:preferences)
    |> Repo.get(id)
  end

  ## Registration & profile ----------------------------------------------------

  @spec register_user(user_params()) :: {:ok, User.t()} | {:error, Ecto.Changeset.t()}
  def register_user(attrs) do
    %User{}
    |> User.registration_changeset(attrs)
    |> Repo.insert()
  end

  @spec update_profile(User.t(), map()) :: {:ok, User.t()} | {:error, Ecto.Changeset.t()}
  def update_profile(%User{} = user, attrs) do
    user
    |> User.profile_changeset(attrs)
    |> Repo.update()
  end

  @spec change_user_profile(User.t(), map()) :: Ecto.Changeset.t()
  def change_user_profile(%User{} = user, attrs \\ %{}) do
    User.profile_changeset(user, attrs)
  end

  ## Preferences ---------------------------------------------------------------

  @spec upsert_preferences(User.t(), map()) ::
          {:ok, Preference.t()} | {:error, Ecto.Changeset.t()}
  def upsert_preferences(%User{id: user_id}, attrs) do
    preference = Repo.get_by(Preference, user_id: user_id) || %Preference{user_id: user_id}

    preference
    |> Preference.changeset(Map.put(attrs, :user_id, user_id))
    |> Repo.insert_or_update()
  end

  @spec get_preferences(User.t()) :: Preference.t() | nil
  def get_preferences(%User{id: user_id}) do
    Repo.get_by(Preference, user_id: user_id)
  end

  @spec delete_preferences(User.t()) :: :ok | {:error, :not_found | Ecto.Changeset.t()}
  def delete_preferences(%User{id: user_id}) do
    case Repo.get_by(Preference, user_id: user_id) do
      nil ->
        {:error, :not_found}

      preference ->
        case Repo.delete(preference) do
          {:ok, _} -> :ok
          {:error, changeset} -> {:error, changeset}
        end
    end
  end

  ## Authentication ------------------------------------------------------------

  @spec authenticate(String.t(), String.t()) ::
          {:ok, User.t()} | {:error, :invalid_credentials | :banned}
  def authenticate(identifier, password) when is_binary(identifier) and is_binary(password) do
    query =
      from u in User,
        where: ilike(u.email, ^identifier) or u.username == ^identifier,
        preload: [:current_ban]

    with %User{} = user <- Repo.one(query),
         true <- Password.verify?(password, user.password_hash) do
      if active_ban?(user) do
        {:error, :banned}
      else
        {:ok, user}
      end
    else
      _ -> {:error, :invalid_credentials}
    end
  end

  defp active_ban?(%User{current_ban: nil}), do: false
  defp active_ban?(%User{current_ban: %UserBan{expires_at: nil}}), do: true

  defp active_ban?(%User{current_ban: %UserBan{expires_at: expires_at}}) do
    DateTime.compare(expires_at, DateTime.utc_now()) == :gt
  end

  ## Ban management ------------------------------------------------------------

  @spec ban_user(User.t(), map()) :: {:ok, UserBan.t()} | {:error, Ecto.Changeset.t()}
  def ban_user(%User{id: user_id}, attrs) do
    with {:ok, ban} <-
           %UserBan{user_id: user_id}
           |> UserBan.changeset(attrs)
           |> Repo.insert() do
      Repo.update_all(from(u in User, where: u.id == ^user_id),
        set: [current_ban_id: ban.id],
        inc: [ban_count: 1]
      )

      {:ok, ban}
    end
  end

  @spec lift_ban(UserBan.t()) :: :ok | {:error, term()}
  def lift_ban(%UserBan{id: id, user_id: user_id} = ban) do
    now = DateTime.utc_now()

    case Repo.transaction(fn ->
           Repo.update!(
             Ecto.Changeset.change(ban, %{
               expires_at: ban.expires_at || now,
               metadata: Map.put(ban.metadata || %{}, "lifted_at", now)
             })
           )

           Repo.update_all(
             from(u in User, where: u.id == ^user_id and u.current_ban_id == ^id),
             set: [current_ban_id: nil]
           )

           :ok
         end) do
      {:ok, :ok} -> :ok
      {:error, reason} -> {:error, reason}
    end
  end

  ## Helpers -------------------------------------------------------------------

  @spec change_user(User.t(), map()) :: Ecto.Changeset.t()
  def change_user(%User{} = user, attrs \\ %{}) do
    User.registration_changeset(user, attrs)
  end

  @doc """
  Returns true when no existing user (case-insensitive) owns the given username.
  """
  @spec username_available?(String.t()) :: boolean()
  def username_available?(username) when is_binary(username) do
    normalized = username |> String.trim() |> String.downcase()

    if normalized == "" do
      false
    else
      query =
        from u in User,
          select: 1,
          where: fragment("lower(?) = ?", u.username, ^normalized),
          limit: 1

      Repo.one(query) == nil
    end
  end

  def username_available?(_), do: false

  ## Password Reset ------------------------------------------------------------

  @doc """
  Initiates a password reset by creating a token and sending email.
  """
  @spec request_password_reset(String.t(), String.t()) ::
          {:ok, PasswordReset.t()} | {:error, :user_not_found | term()}
  def request_password_reset(email, base_url) when is_binary(email) do
    with %User{} = user <- Repo.get_by(User, email: String.downcase(email)),
         token <- generate_secure_token(),
         expires_at <- DateTime.add(DateTime.utc_now(), 3600, :second),
         {:ok, reset} <- create_password_reset(user.id, token, expires_at),
         reset_url <- build_reset_url(base_url, token),
         email <- Email.password_reset_email(user, reset_url),
         {:ok, _result} <- Mailer.deliver(email) do
      {:ok, reset}
    else
      nil -> {:error, :user_not_found}
      {:error, reason} -> {:error, reason}
    end
  end

  @doc """
  Validates and consumes a password reset token, updating the user's password.
  """
  @spec reset_password_with_token(String.t(), String.t()) ::
          {:ok, User.t()} | {:error, :invalid_token | :expired_token | Ecto.Changeset.t()}
  def reset_password_with_token(token, new_password) when is_binary(token) do
    now = DateTime.utc_now()

    with %PasswordReset{} = reset <- Repo.get_by(PasswordReset, token: token),
         true <- is_nil(reset.used_at) || {:error, :invalid_token},
         :gt <- DateTime.compare(reset.expires_at, now) || {:error, :expired_token},
         %User{} = user <- Repo.get(User, reset.user_id),
         {:ok, updated_user} <- update_password(user, new_password),
         {:ok, _used_reset} <-
           reset |> PasswordReset.mark_as_used() |> Repo.update() do
      {:ok, updated_user}
    else
      nil -> {:error, :invalid_token}
      {:error, reason} -> {:error, reason}
      _ -> {:error, :invalid_token}
    end
  end

  defp create_password_reset(user_id, token, expires_at) do
    %PasswordReset{}
    |> PasswordReset.create_changeset(%{
      user_id: user_id,
      token: token,
      expires_at: expires_at
    })
    |> Repo.insert()
  end

  defp update_password(%User{} = user, new_password) do
    {:ok, password_hash} = Password.hash(new_password)

    user
    |> Ecto.Changeset.change(%{password_hash: password_hash})
    |> Repo.update()
  end

  defp generate_secure_token do
    :crypto.strong_rand_bytes(32)
    |> Base.url_encode64(padding: false)
  end

  defp build_reset_url(base_url, token) do
    "#{base_url}/reset-password?token=#{token}"
  end

  @doc """
  Fetches a user by ID, returning {:ok, user} or {:error, :not_found}.
  """
  @spec fetch_user(Ecto.UUID.t()) :: {:ok, User.t()} | {:error, :not_found}
  def fetch_user(user_id) do
    case get_user(user_id) do
      nil -> {:error, :not_found}
      user -> {:ok, user}
    end
  end

  @doc """
  Removes the active ban for a user by calling lift_ban.
  """
  @spec unban_user(User.t()) :: {:ok, User.t()} | {:error, :no_active_ban}
  def unban_user(%User{current_ban_id: nil}), do: {:error, :no_active_ban}

  def unban_user(%User{current_ban_id: ban_id} = user) when not is_nil(ban_id) do
    ban = Repo.get!(UserBan, ban_id)

    case lift_ban(ban) do
      :ok -> {:ok, Repo.preload(user, :current_ban, force: true)}
      {:error, reason} -> {:error, reason}
    end
  end
end
