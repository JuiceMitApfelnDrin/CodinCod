defmodule CodinCod.Game do
  use Ecto.Schema
  import Ecto.Changeset
  alias CodinCod.Game.GameOptions
  alias CodinCod.Accounts.User
  alias CodinCod.Puzzle


  schema "games" do
    belongs_to :puzzle, Puzzle
    belongs_to :owner, User
    many_to_many :players, User, join_through: "games_players"

    field :start_time, :utc_datetime
    embeds_one :options, GameOptions

# export const gameEntitySchema = z.object({
# 	players: z.array(objectIdSchema.or(userDtoSchema)),
# 	owner: objectIdSchema.or(userDtoSchema),
# 	puzzle: objectIdSchema.or(puzzleDtoSchema),
# 	startTime: acceptedDateSchema,
# 	endTime: acceptedDateSchema,
# 	options: gameOptionsSchema,
# 	createdAt: acceptedDateSchema,
# 	playerSubmissions: z
# 		.array(objectIdSchema.or(submissionDtoSchema))
# 		.default([]),
# });

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(game, attrs) do
    game
    |> cast(attrs, [])
    |> validate_required([])
  end

  defmodule GameOptions do
    use Ecto.Schema
    alias CodinCod.ProgrammingLanguage

    @required_fields ~w(duration_in_seconds)a
    @optional_fields ~w(visibility mode)a

    embedded_schema do
      many_to_many(:allowed_languages, ProgrammingLanguage, join_through: "game_options_programming_languages")

      field(:duration_in_seconds, :integer)
      field(:visbility, Ecto.Enum, values: ~w(public private)a, default: :public)
      field(:mode, Ecto.Enum, values: ~w(casual rated)a, default: :rated)
    end

    @doc false
    def changeset(profile_info, attrs) do
      profile_info
      |> cast(attrs, @required_fields ++ @optional_fields)
      |> cast_assoc(:allowed_languages)
      |> validate_required(@required_fields)
    end
  end
end
