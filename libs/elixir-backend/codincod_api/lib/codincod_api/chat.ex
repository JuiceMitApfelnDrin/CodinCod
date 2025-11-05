defmodule CodincodApi.Chat do
  @moduledoc """
  Provides persistence helpers for multiplayer chat transcripts.
  """

  import Ecto.Query, warn: false
  alias CodincodApi.Repo

  alias CodincodApi.Chat.ChatMessage

  @default_preloads [user: [], game: []]

  @spec list_messages_for_game(Ecto.UUID.t(), keyword()) :: [ChatMessage.t()]
  def list_messages_for_game(game_id, opts \\ []) do
    ChatMessage
    |> where([m], m.game_id == ^game_id)
    |> maybe_include_deleted(opts)
    |> order_by([m], asc: m.inserted_at)
    |> maybe_limit(opts)
    |> maybe_preload(opts)
    |> Repo.all()
  end

  @spec get_message!(Ecto.UUID.t(), keyword()) :: ChatMessage.t()
  def get_message!(id, opts \\ []) do
    ChatMessage
    |> maybe_preload(opts)
    |> Repo.get!(id)
  end

  @spec post_message(map(), keyword()) :: {:ok, ChatMessage.t()} | {:error, Ecto.Changeset.t()}
  def post_message(attrs, opts \\ []) do
    %ChatMessage{}
    |> ChatMessage.create_changeset(attrs)
    |> Repo.insert()
    |> maybe_preload_result(opts)
  end

  @spec soft_delete_message(ChatMessage.t(), map()) ::
          {:ok, ChatMessage.t()} | {:error, Ecto.Changeset.t()}
  def soft_delete_message(%ChatMessage{} = message, attrs \\ %{}) do
    message
    |> ChatMessage.delete_changeset(attrs)
    |> Repo.update()
  end

  defp maybe_include_deleted(query, opts) do
    if Keyword.get(opts, :include_deleted, false) do
      query
    else
      where(query, [m], m.is_deleted == false)
    end
  end

  defp maybe_limit(query, opts) do
    case Keyword.get(opts, :limit) do
      nil -> query
      limit when is_integer(limit) and limit > 0 -> limit(query, ^limit)
      _ -> query
    end
  end

  defp maybe_preload(query, opts) do
    case Keyword.get(opts, :preload, @default_preloads) do
      nil -> query
      preloads -> preload(query, ^preloads)
    end
  end

  defp maybe_preload_result({:ok, record}, opts) do
    preloads = Keyword.get(opts, :preload, @default_preloads)

    {:ok,
     case preloads do
       nil -> record
       _ -> Repo.preload(record, preloads)
     end}
  end

  defp maybe_preload_result(other, _opts), do: other
end
