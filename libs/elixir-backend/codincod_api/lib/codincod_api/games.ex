defmodule CodincodApi.Games do
  @moduledoc """
  Games context encapsulating multiplayer lobby management and player membership.
  """

  import Ecto.Query, warn: false
  alias Ecto.{Changeset, Multi}
  alias CodincodApi.Repo

  alias CodincodApi.Games.{Game, GamePlayer}

  @type game_params :: map()

  @spec list_waiting_rooms() :: [Game.t()]
  def list_waiting_rooms do
    Game
    |> where([g], g.status == "waiting")
    |> preload([:owner, :puzzle, players: :user])
    |> Repo.all()
  end

  @spec get_game!(Ecto.UUID.t(), keyword()) :: Game.t()
  def get_game!(id, opts \\ []) do
    Game
    |> maybe_preload(opts)
    |> Repo.get!(id)
  end

  @spec create_game(game_params()) :: {:ok, Game.t()} | {:error, Ecto.Changeset.t()}
  def create_game(attrs) do
    with {:ok, owner_id} <- fetch_owner_id(attrs) do
      Multi.new()
      |> Multi.insert(:game, Game.changeset(%Game{}, attrs))
      |> Multi.run(:host, fn repo, %{game: game} ->
        %GamePlayer{}
        |> GamePlayer.changeset(%{
          user_id: owner_id,
          game_id: game.id,
          joined_at: DateTime.utc_now(),
          role: "host"
        })
        |> repo.insert()
      end)
      |> Repo.transaction()
      |> case do
        {:ok, %{game: game}} -> {:ok, preload_assocs(game)}
        {:error, _step, changeset, _} -> {:error, changeset}
      end
    end
  end

  @spec join_game(Game.t(), map()) :: {:ok, GamePlayer.t()} | {:error, Ecto.Changeset.t()}
  def join_game(%Game{id: game_id}, %{user_id: _user_id} = attrs) do
    %GamePlayer{}
    |> GamePlayer.changeset(
      attrs
      |> Map.put(:game_id, game_id)
      |> Map.put_new(:joined_at, DateTime.utc_now())
      |> Map.put_new(:role, "player")
    )
    |> Repo.insert()
  end

  @spec leave_game(Game.t(), Ecto.UUID.t()) :: :ok
  def leave_game(%Game{id: game_id}, user_id) do
    Repo.delete_all(
      from gp in GamePlayer, where: gp.game_id == ^game_id and gp.user_id == ^user_id
    )

    :ok
  end

  @spec transition_game(Game.t(), String.t(), map()) ::
          {:ok, Game.t()} | {:error, Ecto.Changeset.t()}
  def transition_game(%Game{} = game, status, attrs \\ %{}) do
    game
    |> Game.changeset(Map.merge(attrs, %{status: status}))
    |> Repo.update()
  end

  @spec list_games_for_user(Ecto.UUID.t()) :: [Game.t()]
  def list_games_for_user(user_id) do
    Game
    |> join(:inner, [g], gp in assoc(g, :players))
    |> where([_g, gp], gp.user_id == ^user_id)
    |> preload([:owner, :puzzle, players: :user])
    |> Repo.all()
  end

  defp maybe_preload(query, opts) do
    case Keyword.get(opts, :preload) do
      nil -> query
      preloads -> preload(query, ^preloads)
    end
  end

  defp preload_assocs(game) do
    Repo.preload(game, [:owner, :puzzle, players: :user])
  end

  defp fetch_owner_id(attrs) do
    case Map.get(attrs, :owner_id) || Map.get(attrs, "owner_id") do
      nil ->
        changeset =
          %Game{}
          |> Game.changeset(attrs)
          |> Changeset.add_error(:owner_id, "can't be blank")

        {:error, changeset}

      owner_id ->
        {:ok, owner_id}
    end
  end
end
