defmodule CodincodApi.Accounts.UserBan do
  @moduledoc """
  Represents a moderation ban applied to a user.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias CodincodApi.Accounts.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "user_bans" do
    field :legacy_id, :string
    field :ban_type, :string
    field :reason, :string
    field :metadata, :map, default: %{}
    field :expires_at, :utc_datetime_usec

    belongs_to :user, User
    belongs_to :banned_by, User

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "Ban metadata tying moderator actions to affected users."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          legacy_id: String.t() | nil,
          ban_type: String.t() | nil,
          reason: String.t() | nil,
          metadata: map(),
          expires_at: DateTime.t() | nil,
          user_id: Ecto.UUID.t() | nil,
          banned_by_id: Ecto.UUID.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(ban, attrs) do
    ban
    |> cast(attrs, [
      :legacy_id,
      :ban_type,
      :reason,
      :metadata,
      :expires_at,
      :user_id,
      :banned_by_id
    ])
    |> validate_required([:ban_type, :reason, :user_id, :banned_by_id])
    |> validate_length(:reason, min: 10, max: 500)
    |> validate_inclusion(:ban_type, ["temporary", "permanent"])
  end
end
