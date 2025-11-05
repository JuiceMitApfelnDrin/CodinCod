defmodule CodincodApi.Languages.ProgrammingLanguage do
  @moduledoc """
  Programming language entity mirrored from the Node backend.
  """

  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "programming_languages" do
    field :legacy_id, :string
    field :language, :string
    field :version, :string
    field :aliases, {:array, :string}, default: []
    field :runtime, :string
    field :display_order, :integer
    field :is_active, :boolean, default: true

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "Data representation of a programming language runtime entry."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          legacy_id: String.t() | nil,
          language: String.t() | nil,
          version: String.t() | nil,
          aliases: [String.t()],
          runtime: String.t() | nil,
          display_order: integer() | nil,
          is_active: boolean() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(language, attrs) do
    language
    |> cast(attrs, [
      :legacy_id,
      :language,
      :version,
      :aliases,
      :runtime,
      :display_order,
      :is_active
    ])
    |> validate_required([:language, :version])
    |> unique_constraint([:language, :version],
      name: :programming_languages_language_version_index
    )
  end
end
