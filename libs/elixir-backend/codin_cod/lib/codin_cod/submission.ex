defmodule CodinCod.Submission do
  use Ecto.Schema
  import Ecto.Changeset
  alias CodinCod.Accounts.User
  alias CodinCod.Puzzle
  alias CodinCod.ProgrammingLanguage
  alias CodinCod.Submission.SubmissionResult

  schema "submissions" do
    belongs_to :programming_language, ProgrammingLanguage
    belongs_to :puzzle, Puzzle
    belongs_to :user, User

    field :code, :string
    embeds_one :result, SubmissionResult

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(submission, attrs) do
    submission
    |> cast_embed(:result)
    |> cast(attrs, [:code, :language, :language_version])
    |> validate_required([:code, :language, :language_version])
  end

  defmodule SubmissionResult do
    use Ecto.Schema

    embedded_schema do
      field(:type, Ecto.Enum, values: ~w(error success unknown)a)
      field(:success_rate, :float)
    end

    @doc false
    def changeset(result_info, attrs) do
      result_info
      |> cast(attrs, [:type, :success_rate])
    end
  end
end
