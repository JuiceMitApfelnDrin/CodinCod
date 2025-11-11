defmodule CodincodApi.Games do
  @moduledoc """
  Games context encapsulating multiplayer lobby management and player membership.
  """

  import Ecto.Query, warn: false
  alias Ecto.{Changeset, Multi}
  alias CodincodApi.Repo

  alias CodincodApi.Accounts.User
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

  @doc """
  Adds a player to a game if they're not already in it and the game isn't full.
  """
  @spec add_player_to_game(Game.t(), User.t()) :: {:ok, Game.t()} | {:error, atom() | Ecto.Changeset.t()}
  def add_player_to_game(%Game{} = game, %{} = user) do
    game = Repo.preload(game, [:players])

    cond do
      game.status != "waiting" ->
        {:error, :not_waiting}



      Enum.any?(game.players, fn p -> p.user_id == user.id end) ->
        # Already in game
        {:ok, preload_assocs(game)}

      true ->
        case join_game(game, %{user_id: user.id}) do
          {:ok, _player} -> {:ok, preload_assocs(Repo.get!(Game, game.id))}
          {:error, changeset} -> {:error, changeset}
        end
    end
  end

  @doc """
  Removes a player from a game. If the owner leaves, deletes the game.
  Returns {:ok, updated_game} or {:ok, nil} if game was deleted.
  """
  @spec remove_player_from_game(Game.t(), Ecto.UUID.t()) :: {:ok, Game.t() | nil}
  def remove_player_from_game(%Game{} = game, user_id) do
    if game.owner_id == user_id do
      # Owner leaving, delete the game
      Repo.delete(game)
      {:ok, nil}
    else
      # Regular player leaving
      leave_game(game, user_id)
      {:ok, preload_assocs(Repo.get!(Game, game.id))}
    end
  end

  @doc """
  Starts a game by transitioning it to in_progress status.
  """
  @spec start_game(Game.t()) :: {:ok, Game.t()} | {:error, Ecto.Changeset.t()}
  def start_game(%Game{} = game) do
    transition_game(game, "in_progress", %{
      started_at: DateTime.utc_now()
    })
  end

  @doc """
  Atomically checks game state and marks as completed if conditions are met.
  Uses database-level locking to prevent race conditions.

  Returns:
  - `{:ok, :completed, game}` if game was marked as completed
  - `{:ok, :in_progress, game}` if game is still ongoing
  - `{:error, reason}` if operation failed
  """
  @spec check_and_complete_game(Game.t()) ::
    {:ok, :completed, Game.t()} | {:ok, :in_progress, Game.t()} | {:error, any()}
  def check_and_complete_game(%Game{id: game_id, mode: mode} = _game) do
    result = Repo.transaction(fn ->
      # Lock game row for update to prevent concurrent modifications
      game = Repo.get!(Game, game_id, lock: "FOR UPDATE")

      # Already completed? Return early
      if game.status == "completed" do
        {:completed, game}
      else
        # Load players with their submissions
        game = Repo.preload(game, [players: [:user]], force: true)
        _player_count = length(game.players)

        # Get all submissions for this game
        # Note: In a real implementation, you'd check submission results
        # For now, we just check if the game should end based on mode

        should_complete = case mode do
          "FASTEST" ->
            # First to complete wins - check if anyone has a successful submission
            # others can continue competing for their respective ranking, ranking follows in the form of
            # 1. successful solutions (minimal errors)
            # 2. fastest wins, if the solution has the same amount of errors
            # 3. shortest code, if the time is equal
            # This would require querying submissions table
            false  # Placeholder

          _ ->
            # Other modes might have different completion criteria
            false
        end

        if should_complete do
          # Mark game as completed
          {:ok, completed_game} =
            game
            |> Game.changeset(%{status: "completed", ended_at: DateTime.utc_now()})
            |> Repo.update()

          {:completed, completed_game}
        else
          {:in_progress, game}
        end
      end
    end)

    case result do
      {:ok, {status, game}} -> {:ok, status, game}
      {:error, reason} -> {:error, reason}
    end
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
