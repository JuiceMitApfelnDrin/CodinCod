defmodule CodincodApi.Submissions.Submission do
  @moduledoc """
  Submission schema storing the code, execution result and linkage to puzzles and games.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias CodincodApi.{Accounts.User, Puzzles.Puzzle}
  alias CodincodApi.Games.Game
  alias CodincodApi.Languages.ProgrammingLanguage

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "submissions" do
    field :legacy_id, :string
    field :code, :string
    field :result, :map, default: %{}
    field :score, :float
    field :legacy_game_submission_id, :string

    belongs_to :puzzle, Puzzle
    belongs_to :user, User
    belongs_to :programming_language, ProgrammingLanguage
    belongs_to :game, Game

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "Code run submitted by a user for evaluation."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          legacy_id: String.t() | nil,
          code: String.t() | nil,
          result: map(),
          score: float() | nil,
          legacy_game_submission_id: String.t() | nil,
          puzzle_id: Ecto.UUID.t() | nil,
          user_id: Ecto.UUID.t() | nil,
          programming_language_id: Ecto.UUID.t() | nil,
          game_id: Ecto.UUID.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @spec create_changeset(t(), map()) :: Ecto.Changeset.t()
  def create_changeset(submission, attrs) do
    submission
    |> cast(attrs, [
      :legacy_id,
      :puzzle_id,
      :user_id,
      :programming_language_id,
      :game_id,
      :code,
      :result,
      :score,
      :legacy_game_submission_id
    ])
    |> validate_required([:puzzle_id, :user_id, :programming_language_id, :code])
    |> validate_length(:code, min: 1)
  end

  @spec update_result_changeset(t(), map()) :: Ecto.Changeset.t()
  def update_result_changeset(submission, attrs) do
    submission
    |> cast(attrs, [:result, :score])
    |> validate_required([:result])
  end
end
