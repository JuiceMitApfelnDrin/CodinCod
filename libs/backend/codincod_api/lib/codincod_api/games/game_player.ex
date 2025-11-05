defmodule CodincodApi.Games.GamePlayer do
  @moduledoc """
  Join table linking users to games with metadata about their participation.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias CodincodApi.Games.Game
  alias CodincodApi.Accounts.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "game_players" do
    field :legacy_id, :string
    field :joined_at, :utc_datetime_usec
    field :left_at, :utc_datetime_usec
    field :role, :string, default: "player"
    field :score, :integer
    field :placement, :integer

    belongs_to :game, Game
    belongs_to :user, User

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "Join association for users participating in a multiplayer game."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          legacy_id: String.t() | nil,
          joined_at: DateTime.t() | nil,
          left_at: DateTime.t() | nil,
          role: String.t() | nil,
          score: integer() | nil,
          placement: integer() | nil,
          game_id: Ecto.UUID.t() | nil,
          user_id: Ecto.UUID.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(player, attrs) do
    player
    |> cast(attrs, [
      :legacy_id,
      :joined_at,
      :left_at,
      :role,
      :score,
      :placement,
      :game_id,
      :user_id
    ])
    |> validate_required([:joined_at, :game_id, :user_id])
    |> validate_inclusion(:role, ["player", "spectator", "host"])
    |> unique_constraint([:game_id, :user_id])
  end
end
