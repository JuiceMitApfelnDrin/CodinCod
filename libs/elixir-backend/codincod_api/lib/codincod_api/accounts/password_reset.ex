defmodule CodincodApi.Accounts.PasswordReset do
  @moduledoc """
  Schema for tracking password reset requests with tokens and expiry.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias CodincodApi.Accounts.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "password_resets" do
    field :token, :string
    field :expires_at, :utc_datetime_usec
    field :used_at, :utc_datetime_usec

    belongs_to :user, User

    timestamps(type: :utc_datetime_usec)
  end

  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          token: String.t() | nil,
          expires_at: DateTime.t() | nil,
          used_at: DateTime.t() | nil,
          user_id: Ecto.UUID.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @doc """
  Changeset for creating a new password reset request.
  """
  @spec create_changeset(t(), map()) :: Ecto.Changeset.t()
  def create_changeset(reset, attrs) do
    reset
    |> cast(attrs, [:user_id, :token, :expires_at])
    |> validate_required([:user_id, :token, :expires_at])
    |> unique_constraint(:token)
  end

  @doc """
  Marks the reset token as used.
  """
  @spec mark_as_used(t()) :: Ecto.Changeset.t()
  def mark_as_used(reset) do
    reset
    |> change(%{used_at: DateTime.utc_now()})
  end
end
