defmodule CodincodApi.Moderation.Report do
  @moduledoc """
  User submitted report describing problematic content or behaviour.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias CodincodApi.Accounts.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @problem_types ["puzzle", "user", "comment", "game_chat"]
  @statuses ["pending", "resolved", "rejected"]

  schema "reports" do
    field :legacy_id, :string
    field :problem_type, :string
    field :problem_reference_id, :binary_id
    field :problem_reference_snapshot, :map, default: %{}
    field :explanation, :string
    field :status, :string, default: "pending"
    field :resolution_notes, :string
    field :resolved_at, :utc_datetime_usec
    field :metadata, :map, default: %{}

    belongs_to :reported_by, User
    belongs_to :resolved_by, User

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "Report awaiting moderation handling."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          legacy_id: String.t() | nil,
          problem_type: String.t(),
          problem_reference_id: Ecto.UUID.t() | nil,
          problem_reference_snapshot: map(),
          explanation: String.t() | nil,
          status: String.t(),
          resolution_notes: String.t() | nil,
          resolved_at: DateTime.t() | nil,
          metadata: map(),
          reported_by_id: Ecto.UUID.t() | nil,
          resolved_by_id: Ecto.UUID.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @spec create_changeset(t(), map()) :: Ecto.Changeset.t()
  def create_changeset(report, attrs) do
    report
    |> cast(attrs, [
      :legacy_id,
      :problem_type,
      :problem_reference_id,
      :problem_reference_snapshot,
      :explanation,
      :status,
      :metadata,
      :reported_by_id
    ])
    |> validate_required([:problem_type, :problem_reference_id, :explanation, :reported_by_id])
    |> validate_length(:explanation, min: 10, max: 2_000)
    |> validate_inclusion(:problem_type, @problem_types)
    |> validate_inclusion(:status, @statuses)
    |> normalize_map_fields([:problem_reference_snapshot, :metadata])
  end

  @spec resolve_changeset(t(), map()) :: Ecto.Changeset.t()
  def resolve_changeset(report, attrs) do
    report
    |> cast(attrs, [:status, :resolution_notes, :resolved_by_id, :resolved_at, :metadata])
    |> validate_required([:status, :resolved_by_id])
    |> validate_inclusion(:status, @statuses)
    |> normalize_map_fields([:metadata])
    |> put_change(:resolved_at, Map.get(attrs, :resolved_at, DateTime.utc_now()))
  end

  defp normalize_map_fields(changeset, fields) do
    Enum.reduce(fields, changeset, fn field, acc ->
      update_change(acc, field, fn
        nil -> %{}
        value when is_map(value) -> value
        _ -> %{}
      end)
    end)
  end
end
