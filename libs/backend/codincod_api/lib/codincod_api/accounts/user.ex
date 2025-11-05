defmodule CodincodApi.Accounts.User do
  @moduledoc """
  User schema mapping the Fastify/Mongo user document to PostgreSQL.

  Mirrors the fields exposed by `UserEntity` from the TypeScript backend:
  - `username`
  - `email`
  - `profile`
  - `role`
  - moderation counters and ban linkage
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias CodincodApi.Accounts.{User, UserBan, Preference}

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @username_min_length 3
  @username_max_length 20
  @username_regex ~r/^[A-Za-z0-9_-]+$/
  @password_min_length 14
  @email_regex ~r/^[^\s@]+@[^\s@]+$/

  @typedoc """
  Serializable profile payload stored as JSONB.
  """
  @type profile :: %{
          optional(String.t()) => String.t() | [String.t()] | nil
        }

  schema "users" do
    field :legacy_id, :string
    field :legacy_username, :string
    field :username, :string
    field :email, :string
    field :password, :string, virtual: true
    field :password_confirmation, :string, virtual: true
    field :password_hash, :string
    field :profile, :map, default: %{}
    field :role, :string, default: "user"
    field :report_count, :integer, default: 0
    field :ban_count, :integer, default: 0
    field :legacy_current_ban_id, :string

    belongs_to :current_ban, UserBan, foreign_key: :current_ban_id

    has_one :preferences, Preference, foreign_key: :user_id
    has_many :user_bans, UserBan, foreign_key: :user_id

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "Registered user account record."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          legacy_id: String.t() | nil,
          legacy_username: String.t() | nil,
          username: String.t() | nil,
          email: String.t() | nil,
          password: String.t() | nil,
          password_confirmation: String.t() | nil,
          password_hash: String.t() | nil,
          profile: map(),
          role: String.t() | nil,
          report_count: non_neg_integer() | nil,
          ban_count: non_neg_integer() | nil,
          legacy_current_ban_id: String.t() | nil,
          current_ban_id: Ecto.UUID.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @doc """
  Changeset for user registration.
  """
  @spec registration_changeset(User.t(), map()) :: Ecto.Changeset.t()
  def registration_changeset(%User{} = user, attrs) do
    user
    |> cast(attrs, [
      :legacy_id,
      :legacy_username,
      :username,
      :email,
      :password,
      :password_confirmation,
      :profile,
      :role
    ])
    |> validate_required([:username, :email, :password])
    |> validate_format(:email, @email_regex)
    |> validate_length(:username, min: @username_min_length, max: @username_max_length)
    |> validate_format(:username, @username_regex)
    |> validate_length(:password, min: @password_min_length)
    |> validate_confirmation(:password, with: :password_confirmation)
    |> put_default_profile()
    |> unique_constraint(:username)
    |> unique_constraint(:email)
    |> put_password_hash()
  end

  @doc """
  Changeset for updating profile information.
  """
  @spec profile_changeset(User.t(), map()) :: Ecto.Changeset.t()
  def profile_changeset(%User{} = user, attrs) do
    user
    |> cast(attrs, [:profile])
    |> put_default_profile()
  end

  @doc """
  Changeset for administrative fields such as role.
  """
  @spec admin_changeset(User.t(), map()) :: Ecto.Changeset.t()
  def admin_changeset(%User{} = user, attrs) do
    user
    |> cast(attrs, [:role, :report_count, :ban_count, :current_ban_id])
    |> validate_inclusion(:role, ["user", "moderator", "admin"])
  end

  @doc false
  def reset_password_changeset(%User{} = user, attrs) do
    user
    |> cast(attrs, [:password, :password_confirmation])
    |> validate_required([:password])
    |> validate_confirmation(:password, with: :password_confirmation)
    |> put_password_hash()
  end

  @doc "Minimum username length enforced by the backend."
  @spec username_min_length() :: pos_integer()
  def username_min_length, do: @username_min_length

  @doc "Maximum username length enforced by the backend."
  @spec username_max_length() :: pos_integer()
  def username_max_length, do: @username_max_length

  @doc "Username format regex used for validation."
  @spec username_regex() :: Regex.t()
  def username_regex, do: @username_regex

  @doc "Minimum password length enforced by the backend."
  @spec password_min_length() :: pos_integer()
  def password_min_length, do: @password_min_length

  @doc "Email format regex used for validation."
  @spec email_regex() :: Regex.t()
  def email_regex, do: @email_regex

  defp put_default_profile(changeset) do
    update_change(changeset, :profile, fn
      nil -> %{}
      profile when is_map(profile) -> profile
      _ -> %{}
    end)
  end

  defp put_password_hash(%Ecto.Changeset{valid?: true} = changeset) do
    case fetch_change(changeset, :password) do
      {:ok, password} ->
        case CodincodApi.Accounts.Password.hash(password) do
          {:ok, hash} -> put_change(changeset, :password_hash, hash)
          {:error, reason} -> add_error(changeset, :password, reason)
        end

      :error ->
        changeset
    end
  end

  defp put_password_hash(changeset), do: changeset
end
