defmodule CodincodApiWeb.AccountController do
  @moduledoc """
  Account endpoints mirroring the Fastify account routes (`/account`).
  """

  use CodincodApiWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import Ecto.Query
  alias CodincodApi.{Accounts, Games, Metrics, Repo}
  alias CodincodApi.Accounts.User
  alias CodincodApi.Games.Game
  alias CodincodApi.Metrics.UserMetric
  alias CodincodApiWeb.OpenAPI.Schemas

  action_fallback CodincodApiWeb.FallbackController

  @profile_schema %{
    "bio" => {:string, 0, 500},
    "location" => {:string, 0, 100},
    "picture" => :string_url,
    "socials" => :string_url_list
  }
  @profile_fields Map.keys(@profile_schema)

  tags(["Account"])

  operation(:show,
    summary: "Current account status",
    responses: %{
      200 => {"Authenticated account", "application/json", Schemas.Account.StatusResponse},
      401 => {"Unauthorized", "application/json", Schemas.Account.StatusResponse},
      500 => {"Server error", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def show(conn, _params) do
    with %User{id: user_id, username: username} <- conn.assigns[:current_user],
         %User{} = user <- Accounts.get_user!(user_id) do
      json(conn, %{
        isAuthenticated: true,
        userId: user.id,
        username: username,
        role: user.role
      })
    else
      _ ->
        conn
        |> put_status(:unauthorized)
        |> json(%{isAuthenticated: false, message: "Not authenticated"})
    end
  end

  operation(:update_profile,
    summary: "Update profile",
    request_body:
      {"Profile properties", "application/json", Schemas.Account.ProfileUpdateRequest},
    responses: %{
      200 => {"Profile updated", "application/json", Schemas.Account.ProfileUpdateResponse},
      400 => {"Validation error", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def update_profile(conn, params) do
    with %User{} = current_user <- conn.assigns[:current_user],
         {:ok, updates} <- normalize_profile_params(params),
         {:ok, %User{} = user} <- Accounts.update_profile(current_user, %{profile: updates}) do
      json(conn, %{message: "Profile updated successfully", profile: user.profile})
    else
      {:error, :invalid_payload, details} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "Invalid profile payload", errors: details})

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Failed to update profile", errors: translate_errors(changeset)})

      _ ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authenticated"})
    end
  end

  operation(:leaderboard_rank,
    summary: "Get current user's leaderboard ranking",
    responses: %{
      200 => {"User ranking", "application/json", Schemas.Leaderboard.UserRankResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def leaderboard_rank(conn, _params) do
    with %User{id: user_id} <- conn.assigns[:current_user] do
      metric = Metrics.get_user_metric(user_id)

      rank =
        if metric do
          calculate_user_rank(user_id, metric.rating)
        else
          nil
        end

      conn
      |> put_status(:ok)
      |> json(%{
        userId: user_id,
        rank: rank,
        rating: metric && metric.rating,
        puzzlesSolved: metric && metric.puzzles_solved,
        totalSubmissions: metric && metric.total_submissions
      })
    else
      _ ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Not authenticated"})
    end
  end

  operation(:games,
    summary: "Get games for current user",
    responses: %{
      200 => {"User games", "application/json", Schemas.Games.UserGamesResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def games(conn, _params) do
    with %User{id: user_id} <- conn.assigns[:current_user] do
      user_games = Games.list_games_for_user(user_id)

      conn
      |> put_status(:ok)
      |> json(%{
        games: Enum.map(user_games, &serialize_game/1),
        count: length(user_games)
      })
    else
      _ ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Not authenticated"})
    end
  end

  ## Private helper functions

  defp serialize_game(%Game{} = game) do
    %{
      id: game.id,
      status: game.status,
      mode: game.mode,
      visibility: game.visibility,
      maxDurationSeconds: game.max_duration_seconds,
      rated: game.rated,
      owner:
        game.owner &&
          %{
            id: game.owner.id,
            username: game.owner.username
          },
      puzzle:
        game.puzzle &&
          %{
            id: game.puzzle.id,
            title: game.puzzle.title,
            difficulty: game.puzzle.difficulty
          },
      players:
        Enum.map(game.players || [], fn player ->
          %{
            id: player.user.id,
            username: player.user.username,
            role: player.role,
            joinedAt: player.joined_at
          }
        end),
      createdAt: game.inserted_at,
      startedAt: game.started_at,
      endedAt: game.ended_at
    }
  end

  defp calculate_user_rank(user_id, rating) do
    # Count how many users have a higher rating
    count =
      UserMetric
      |> where([m], m.rating > ^rating or (m.rating == ^rating and m.user_id < ^user_id))
      |> Repo.aggregate(:count)

    count + 1
  end

  defp normalize_profile_params(params) when is_map(params) do
    params
    |> Enum.reduce_while(%{}, fn
      {key, value}, acc when key in @profile_fields ->
        case validate_profile_field(key, value) do
          {:ok, normalized} -> {:cont, Map.put(acc, key, normalized)}
          {:error, reason} -> {:halt, {:error, reason}}
        end

      {_key, _value}, acc ->
        {:cont, acc}
    end)
    |> case do
      {:error, reason} -> {:error, :invalid_payload, reason}
      result -> {:ok, result}
    end
  end

  defp normalize_profile_params(_),
    do: {:error, :invalid_payload, %{message: "Expected JSON object"}}

  defp validate_profile_field("bio", value), do: validate_string(value, 0, 500, "bio")
  defp validate_profile_field("location", value), do: validate_string(value, 0, 100, "location")

  defp validate_profile_field("picture", value) when value in [nil, ""], do: {:ok, value}

  defp validate_profile_field("picture", value) do
    if valid_url?(value) do
      {:ok, value}
    else
      {:error, %{field: "picture", message: "must be a valid URL"}}
    end
  end

  defp validate_profile_field("socials", value) when is_list(value) do
    urls = Enum.with_index(value)

    case Enum.reduce_while(urls, [], fn {url, index}, acc ->
           if valid_url?(url) do
             {:cont, [url | acc]}
           else
             {:halt,
              {:error, %{field: "socials", index: index, message: "must contain valid URLs"}}}
           end
         end) do
      {:error, reason} -> {:error, reason}
      urls -> {:ok, Enum.reverse(urls)}
    end
  end

  defp validate_profile_field("socials", _value),
    do: {:error, %{field: "socials", message: "must be an array of URLs"}}

  defp validate_profile_field(_key, _value), do: {:ok, nil}

  defp validate_string(value, min, max, field) when is_binary(value) do
    if String.length(value) <= max and String.length(value) >= min do
      {:ok, value}
    else
      {:error, %{field: field, message: "must be between #{min} and #{max} characters"}}
    end
  end

  defp validate_string(nil, _min, _max, _field), do: {:ok, nil}
  defp validate_string("", _min, _max, _field), do: {:ok, ""}

  defp validate_string(_value, _min, _max, field),
    do: {:error, %{field: field, message: "must be a string"}}

  defp valid_url?(value) do
    case URI.parse(value) do
      %URI{scheme: scheme, host: host} when scheme in ["http", "https"] and is_binary(host) ->
        true

      _ ->
        false
    end
  end

  defp translate_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
  end
end
