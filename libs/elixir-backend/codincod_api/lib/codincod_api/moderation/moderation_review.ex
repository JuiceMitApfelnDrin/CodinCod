defmodule CodincodApi.Moderation.ModerationReview do
  @moduledoc """
  Represents a moderation workflow entry for a puzzle awaiting approval.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias CodincodApi.Accounts.User
  alias CodincodApi.Puzzles.Puzzle

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @statuses ["pending", "approved", "rejected", "revision_requested"]

  schema "moderation_reviews" do
    field :legacy_id, :string
    field :status, :string, default: "pending"
    field :notes, :string
    field :submitted_at, :utc_datetime_usec
    field :resolved_at, :utc_datetime_usec

    belongs_to :puzzle, Puzzle
    belongs_to :reviewer, User

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "Puzzle moderation review lifecycle entity."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          legacy_id: String.t() | nil,
          status: String.t(),
          notes: String.t() | nil,
          submitted_at: DateTime.t() | nil,
          resolved_at: DateTime.t() | nil,
          puzzle_id: Ecto.UUID.t() | nil,
          reviewer_id: Ecto.UUID.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @spec create_changeset(t(), map()) :: Ecto.Changeset.t()
  def create_changeset(review, attrs) do
    review
    |> cast(attrs, [
      :legacy_id,
      :status,
      :notes,
      :submitted_at,
      :resolved_at,
      :puzzle_id,
      :reviewer_id
    ])
    |> validate_required([:puzzle_id])
    |> validate_inclusion(:status, @statuses)
    |> put_change(:submitted_at, Map.get(attrs, :submitted_at, DateTime.utc_now()))
  end

  @spec update_changeset(t(), map()) :: Ecto.Changeset.t()
  def update_changeset(review, attrs) do
    review
    |> cast(attrs, [:status, :notes, :resolved_at, :reviewer_id])
    |> validate_inclusion(:status, @statuses)
    |> maybe_put_resolved_at(attrs)
  end

  defp maybe_put_resolved_at(changeset, attrs) do
    case {get_field(changeset, :status), Map.get(attrs, :resolved_at)} do
      {status, nil} when status in ["approved", "rejected", "revision_requested"] ->
        put_change(changeset, :resolved_at, DateTime.utc_now())

      {_, %DateTime{} = resolved_at} ->
        put_change(changeset, :resolved_at, resolved_at)

      _ ->
        changeset
    end
  end
end
