defmodule CodincodApiWeb.UserController do
  @moduledoc """
  User endpoints that expose profile data, availability checks and author-specific
  resources. The responses are compatible with the legacy Fastify backend.
  """

  use CodincodApiWeb, :controller
  use OpenApiSpex.ControllerSpecs

  require Logger

  alias CodincodApi.Accounts
  alias CodincodApi.Accounts.User
  alias CodincodApi.Puzzles
  alias CodincodApi.Submissions
  alias CodincodApiWeb.OpenAPI.Schemas
  alias CodincodApiWeb.Serializers.{PuzzleSerializer, SubmissionSerializer, UserSerializer}

  action_fallback CodincodApiWeb.FallbackController

  tags(["User"])

  operation(:show,
    summary: "Get user by username",
    parameters: [
      username: [
        in: :path,
        description: "Username to look up",
        schema: %OpenApiSpex.Schema{type: :string}
      ]
    ],
    responses: %{
      200 => {"User", "application/json", Schemas.User.ShowResponse},
      400 => {"Invalid username", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Not found", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  @spec show(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def show(conn, %{"username" => username_param}) do
    with {:ok, username} <- normalize_username(username_param),
         %User{} = user <- Accounts.get_user_by_username(username) do
      json(conn, %{message: "User found", user: UserSerializer.render(user)})
    else
      {:error, :invalid_username, error} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "Invalid username", error: error})

      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{message: "User not found"})
    end
  end

  operation(:activity,
    summary: "Get user activity (puzzles and submissions)",
    parameters: [
      username: [
        in: :path,
        description: "Username to inspect",
        schema: %OpenApiSpex.Schema{type: :string}
      ]
    ],
    responses: %{
      200 => {"Activity", "application/json", Schemas.User.ActivityResponse},
      400 => {"Invalid username", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Not found", "application/json", Schemas.Common.ErrorResponse},
      500 => {"Server error", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  @spec activity(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def activity(conn, %{"username" => username_param}) do
    with {:ok, username} <- normalize_username(username_param),
         %User{} = user <- Accounts.get_user_by_username(username) do
      viewer_id = current_user_id(conn)

      try do
        puzzles =
          if viewer_id == user.id do
            Puzzles.list_author_all(user.id)
          else
            Puzzles.list_author_public(user.id)
          end

        submissions = Submissions.list_by_user(user.id)

        json(conn, %{
          message: "User activity found",
          user: UserSerializer.render(user),
          activity: %{
            puzzles: PuzzleSerializer.render_many(puzzles),
            submissions: SubmissionSerializer.render_many(submissions)
          }
        })
      rescue
        error ->
          Logger.error("Failed to fetch user activity: #{inspect(error)}")

          conn
          |> put_status(:internal_server_error)
          |> json(%{message: "Internal Server Error"})
      end
    else
      {:error, :invalid_username, error} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "Invalid username", error: error})

      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{message: "User not found"})
    end
  end

  operation(:puzzles,
    summary: "List puzzles authored by a user",
    parameters: [
      username: [
        in: :path,
        description: "Username whose puzzles will be listed",
        schema: %OpenApiSpex.Schema{type: :string}
      ],
      page: [
        in: :query,
        schema: %OpenApiSpex.Schema{type: :integer, minimum: 1, default: 1}
      ],
      pageSize: [
        in: :query,
        schema: %OpenApiSpex.Schema{type: :integer, minimum: 1, maximum: 100, default: 20}
      ]
    ],
    responses: %{
      200 => {"Paginated puzzles", "application/json", Schemas.Puzzle.PaginatedListResponse},
      400 => {"Invalid parameters", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Not found", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  @spec puzzles(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def puzzles(conn, params = %{"username" => username_param}) do
    with {:ok, username} <- normalize_username(username_param),
         %User{} = user <- Accounts.get_user_by_username(username) do
      viewer_id = current_user_id(conn)
      pagination = Puzzles.paginate_for_author(user.id, params, viewer_id: viewer_id)

      response = %{
        items: PuzzleSerializer.render_many(pagination.items),
        page: pagination.page,
        pageSize: pagination.page_size,
        totalItems: pagination.total_items,
        totalPages: pagination.total_pages
      }

      json(conn, response)
    else
      {:error, :invalid_username, error} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "Invalid username", error: error})

      nil ->
        conn
        |> put_status(:not_found)
        |> json(%{message: "User not found"})
    end
  end

  operation(:availability,
    summary: "Check username availability",
    parameters: [
      username: [
        in: :path,
        description: "Desired username",
        schema: %OpenApiSpex.Schema{type: :string}
      ]
    ],
    responses: %{
      200 => {"Availability", "application/json", Schemas.User.AvailabilityResponse},
      400 => {"Invalid username", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  @spec availability(Plug.Conn.t(), map()) :: Plug.Conn.t()
  def availability(conn, %{"username" => username_param}) do
    with {:ok, username} <- normalize_username(username_param) do
      json(conn, %{available: Accounts.username_available?(username)})
    else
      {:error, :invalid_username, error} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "Invalid username", error: error})
    end
  end

  defp normalize_username(username) when is_binary(username) do
    trimmed = String.trim(username)
    regex = User.username_regex()
    min_len = User.username_min_length()
    max_len = User.username_max_length()

    cond do
      trimmed == "" ->
        {:error, :invalid_username, %{field: "username", message: "is required"}}

      String.length(trimmed) < min_len or String.length(trimmed) > max_len ->
        {:error, :invalid_username,
         %{field: "username", message: "must be between #{min_len} and #{max_len} characters"}}

      not Regex.match?(regex, trimmed) ->
        {:error, :invalid_username, %{field: "username", message: "contains invalid characters"}}

      true ->
        {:ok, trimmed}
    end
  end

  defp normalize_username(_),
    do: {:error, :invalid_username, %{field: "username", message: "must be a string"}}

  defp current_user_id(conn) do
    case conn.assigns[:current_user] do
      %User{id: id} -> id
      _ -> nil
    end
  end
end
