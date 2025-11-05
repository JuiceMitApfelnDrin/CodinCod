defmodule CodincodApi.Chat.ChatMessage do
  @moduledoc """
  Persisted chat messages exchanged inside multiplayer game rooms.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias CodincodApi.Games.Game
  alias CodincodApi.Accounts.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "chat_messages" do
    field :legacy_id, :string
    field :username_snapshot, :string
    field :message, :string
    field :is_deleted, :boolean, default: false
    field :deleted_at, :utc_datetime_usec

    belongs_to :game, Game
    belongs_to :user, User

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "In-game chat message."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          legacy_id: String.t() | nil,
          username_snapshot: String.t() | nil,
          message: String.t() | nil,
          is_deleted: boolean(),
          deleted_at: DateTime.t() | nil,
          game_id: Ecto.UUID.t() | nil,
          user_id: Ecto.UUID.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @spec create_changeset(t(), map()) :: Ecto.Changeset.t()
  def create_changeset(message, attrs) do
    message
    |> cast(attrs, [
      :legacy_id,
      :username_snapshot,
      :message,
      :is_deleted,
      :deleted_at,
      :game_id,
      :user_id
    ])
    |> validate_required([:username_snapshot, :message, :game_id, :user_id])
    |> validate_length(:message, min: 1, max: 5_000)
  end

  @spec delete_changeset(t(), map()) :: Ecto.Changeset.t()
  def delete_changeset(message, attrs \\ %{}) do
    message
    |> cast(attrs, [:is_deleted, :deleted_at])
    |> change(is_deleted: true)
    |> put_change(:deleted_at, Map.get(attrs, :deleted_at, DateTime.utc_now()))
  end
end
