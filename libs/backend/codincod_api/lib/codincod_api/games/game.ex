defmodule CodincodApi.Games.Game do
  @moduledoc """
  Game schema representing multiplayer sessions.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias CodincodApi.Accounts.User
  alias CodincodApi.Puzzles.Puzzle
  alias CodincodApi.Games.GamePlayer

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "games" do
    field :legacy_id, :string
    field :visibility, :string
    field :mode, :string
    field :rated, :boolean, default: true
    field :status, :string, default: "waiting"
    field :max_duration_seconds, :integer, default: 600
    field :allowed_language_ids, {:array, :binary_id}, default: []
    field :options, :map, default: %{}
    field :started_at, :utc_datetime_usec
    field :ended_at, :utc_datetime_usec

    belongs_to :owner, User
    belongs_to :puzzle, Puzzle

    has_many :players, GamePlayer

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "Multiplayer game session metadata."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          legacy_id: String.t() | nil,
          visibility: String.t() | nil,
          mode: String.t() | nil,
          rated: boolean() | nil,
          status: String.t() | nil,
          max_duration_seconds: integer() | nil,
          allowed_language_ids: [Ecto.UUID.t()],
          options: map(),
          started_at: DateTime.t() | nil,
          ended_at: DateTime.t() | nil,
          owner_id: Ecto.UUID.t() | nil,
          puzzle_id: Ecto.UUID.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(game, attrs) do
    game
    |> cast(attrs, [
      :legacy_id,
      :owner_id,
      :puzzle_id,
      :visibility,
      :mode,
      :rated,
      :status,
      :max_duration_seconds,
      :allowed_language_ids,
      :options,
      :started_at,
      :ended_at
    ])
    |> validate_required([:owner_id, :puzzle_id, :visibility, :mode])
    |> validate_inclusion(:visibility, ["public", "private", "friends"])
    |> validate_inclusion(:status, ["waiting", "in_progress", "completed", "cancelled"])
    |> validate_inclusion(:mode, [
      "FASTEST",
      "SHORTEST",
      "BACKWARDS",
      "HARDCORE",
      "DEBUG",
      "TYPERACER",
      "EFFICIENCY",
      "INCREMENTAL",
      "RANDOM"
    ])
    |> put_default_options()
  end

  defp put_default_options(changeset) do
    update_change(changeset, :options, fn
      nil -> %{}
      options when is_map(options) -> options
      _ -> %{}
    end)
  end
end
