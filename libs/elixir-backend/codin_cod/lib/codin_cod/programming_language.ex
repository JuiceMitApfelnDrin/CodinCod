defmodule CodinCod.ProgrammingLanguage do
  use Ecto.Schema
  import Ecto.Changeset
  alias CodinCod.Game.GameOptions

  @required_fields ~w(language version available_in_piston)a
  @optional_fields ~w()a

  schema "programming_languages" do
    many_to_many :game_options, GameOptions, join_through:  "game_options_programming_languages"

    field(:language, :string)
    field(:version, :string)
    field(:is_available, :boolean)

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(programming_language, attrs) do
    programming_language
    |> cast(attrs, @required_fields ++ @optional_fields)
    |> validate_required(@required_fields)
  end
end
