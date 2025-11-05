defmodule CodincodApiWeb.PuzzleController do
  @moduledoc """
  Puzzle endpoints mirroring Fastify puzzle routes for listing and creation.
  """

  use CodincodApiWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias CodincodApi.Accounts.User
  alias CodincodApi.Puzzles
  alias CodincodApi.Puzzles.Puzzle
  alias CodincodApiWeb.OpenAPI.Schemas
  alias CodincodApiWeb.Serializers.PuzzleSerializer

  action_fallback CodincodApiWeb.FallbackController

  @default_page 1
  @default_page_size 20
  @min_page 1
  @min_page_size 1
  @max_page_size 100

  tags(["Puzzle"])

  operation(:index,
    summary: "List puzzles",
    description:
      "Returns paginated puzzles matching the legacy Fastify `/puzzle` listing response.",
    parameters: [
      page: [
        in: :query,
        description: "Page number",
        schema: %OpenApiSpex.Schema{type: :integer, minimum: 1, default: 1}
      ],
      pageSize: [
        in: :query,
        description: "Number of puzzles per page",
        schema: %OpenApiSpex.Schema{type: :integer, minimum: 1, maximum: 100, default: 20}
      ]
    ],
    responses: %{
      200 => {"Paginated puzzles", "application/json", Schemas.Puzzle.PaginatedListResponse},
      400 => {"Invalid query", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def index(conn, params) do
    case validate_pagination(params) do
      {:ok, pagination} ->
        %{
          items: items,
          page: page,
          page_size: page_size,
          total_items: total_items,
          total_pages: total_pages
        } =
          Puzzles.paginate_all(pagination)

        response = %{
          items: PuzzleSerializer.render_many(items),
          page: page,
          pageSize: page_size,
          totalItems: total_items,
          totalPages: total_pages
        }

        json(conn, response)

      {:error, errors} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "Invalid pagination parameters", errors: errors})
    end
  end

  operation(:create,
    summary: "Create puzzle",
    request_body: {"Puzzle creation payload", "application/json", Schemas.Puzzle.PuzzleCreateRequest},
    responses: %{
      201 => {"Puzzle created", "application/json", Schemas.Puzzle.PuzzleResponse},
      400 => {"Validation error", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      422 => {"Unprocessable entity", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def create(conn, params) do
    with %User{id: user_id} <- conn.assigns[:current_user],
         {:ok, attrs} <- normalize_create_params(params),
         # Set defaults for required DB fields that are optional in API
         attrs_with_defaults = Map.merge(
           %{
             author_id: user_id,
             visibility: "DRAFT",
             difficulty: "BEGINNER"  # Default difficulty for new puzzles
           },
           attrs
         ),
         {:ok, %Puzzle{} = puzzle} <- Puzzles.create_puzzle(attrs_with_defaults) do
      conn
      |> put_status(:created)
      |> json(PuzzleSerializer.render(puzzle))
    else
      nil ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authenticated"})

      {:error, :invalid_payload, details} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "Invalid puzzle payload", errors: details})

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Unable to create puzzle", errors: translate_errors(changeset)})

      {:error, reason} ->
        CodincodApiWeb.FallbackController.call(conn, {:error, reason})
    end
  end

  operation(:show,
    summary: "Get puzzle by ID",
    description: "Returns a single puzzle by ID (public view, no solution details).",
    parameters: [
      id: [
        in: :path,
        description: "Puzzle UUID",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    responses: %{
      200 => {"Puzzle found", "application/json", Schemas.Puzzle.PuzzleResponse},
      404 => {"Puzzle not found", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def show(conn, %{"id" => id}) do
    case Puzzles.fetch_puzzle(id) do
      {:ok, puzzle} ->
        json(conn, PuzzleSerializer.render(puzzle))

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{message: "Puzzle not found"})
    end
  end

  operation(:solution,
    summary: "Get puzzle solution for editing",
    description: "Returns puzzle with full solution details. Only available to puzzle author or admins.",
    parameters: [
      id: [
        in: :path,
        description: "Puzzle UUID",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    responses: %{
      200 => {"Puzzle solution", "application/json", Schemas.Puzzle.PuzzleResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      403 => {"Forbidden", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Puzzle not found", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def solution(conn, %{"id" => id}) do
    with %User{id: user_id, role: role} <- conn.assigns[:current_user],
         {:ok, puzzle} <- Puzzles.fetch_puzzle_with_validators(id),
         :ok <- authorize_puzzle_access(puzzle, user_id, role) do
      json(conn, PuzzleSerializer.render(puzzle))
    else
      nil ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authenticated"})

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{message: "Puzzle not found"})

      {:error, :forbidden} ->
        conn
        |> put_status(:forbidden)
        |> json(%{message: "You don't have permission to access this puzzle's solution"})
    end
  end

  operation(:update,
    summary: "Update puzzle",
    description: "Updates an existing puzzle. Only available to puzzle author or admins.",
    parameters: [
      id: [
        in: :path,
        description: "Puzzle UUID",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    request_body: {"Puzzle update payload", "application/json", Schemas.Puzzle.PuzzleCreateRequest},
    responses: %{
      200 => {"Puzzle updated", "application/json", Schemas.Puzzle.PuzzleResponse},
      400 => {"Validation error", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      403 => {"Forbidden", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Puzzle not found", "application/json", Schemas.Common.ErrorResponse},
      422 => {"Unprocessable entity", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def update(conn, %{"id" => id} = params) do
    with %User{id: user_id, role: role} <- conn.assigns[:current_user],
         {:ok, puzzle} <- Puzzles.fetch_puzzle(id),
         :ok <- authorize_puzzle_access(puzzle, user_id, role),
         {:ok, attrs} <- normalize_update_params(params),
         {:ok, %Puzzle{} = updated_puzzle} <- Puzzles.update_puzzle(puzzle, attrs) do
      json(conn, PuzzleSerializer.render(updated_puzzle))
    else
      nil ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authenticated"})

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{message: "Puzzle not found"})

      {:error, :forbidden} ->
        conn
        |> put_status(:forbidden)
        |> json(%{message: "You don't have permission to update this puzzle"})

      {:error, :invalid_payload, details} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "Invalid puzzle payload", errors: details})

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Unable to update puzzle", errors: translate_errors(changeset)})

      {:error, reason} ->
        CodincodApiWeb.FallbackController.call(conn, {:error, reason})
    end
  end

  operation(:delete,
    summary: "Delete puzzle",
    description: "Deletes a puzzle. Only available to puzzle author or admins.",
    parameters: [
      id: [
        in: :path,
        description: "Puzzle UUID",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    responses: %{
      204 => {"Puzzle deleted", nil, nil},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      403 => {"Forbidden", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Puzzle not found", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def delete(conn, %{"id" => id}) do
    with %User{id: user_id, role: role} <- conn.assigns[:current_user],
         {:ok, puzzle} <- Puzzles.fetch_puzzle(id),
         :ok <- authorize_puzzle_access(puzzle, user_id, role),
         {:ok, _puzzle} <- Puzzles.delete_puzzle(puzzle) do
      send_resp(conn, :no_content, "")
    else
      nil ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authenticated"})

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{message: "Puzzle not found"})

      {:error, :forbidden} ->
        conn
        |> put_status(:forbidden)
        |> json(%{message: "You don't have permission to delete this puzzle"})

      {:error, reason} ->
        CodincodApiWeb.FallbackController.call(conn, {:error, reason})
    end
  end

  defp validate_pagination(params) do
    {page, page_errors} =
      coerce_pagination_param(Map.get(params, "page"), "page", @default_page, min: @min_page)

    {page_size, size_errors} =
      coerce_pagination_param(
        Map.get(params, "pageSize"),
        "pageSize",
        @default_page_size,
        min: @min_page_size,
        max: @max_page_size
      )

    errors = page_errors ++ size_errors

    if errors == [] do
      {:ok, %{page: page, page_size: page_size}}
    else
      {:error, errors}
    end
  end

  defp coerce_pagination_param(nil, _field, default, _opts), do: {default, []}

  defp coerce_pagination_param(value, field, default, opts) when is_binary(value) do
    value
    |> String.trim()
    |> case do
      "" ->
        {default, []}

      trimmed ->
        case Integer.parse(trimmed) do
          {int, ""} -> coerce_pagination_param(int, field, default, opts)
          _ -> {default, [%{field: field, message: "must be an integer"}]}
        end
    end
  end

  defp coerce_pagination_param(value, field, default, opts) when is_integer(value) do
    min = Keyword.get(opts, :min)
    max = Keyword.get(opts, :max)

    cond do
      min && value < min ->
        {default, [%{field: field, message: "must be >= #{min}"}]}

      max && value > max ->
        {default, [%{field: field, message: "must be <= #{max}"}]}

      true ->
        {value, []}
    end
  end

  defp coerce_pagination_param(_value, field, default, _opts),
    do: {default, [%{field: field, message: "must be an integer"}]}

  @allowed_difficulties %{
    "easy" => "BEGINNER",
    "beginner" => "BEGINNER",
    "medium" => "INTERMEDIATE",
    "intermediate" => "INTERMEDIATE",
    "hard" => "ADVANCED",
    "advanced" => "ADVANCED",
    "expert" => "EXPERT"
  }

  defp normalize_create_params(params) when is_map(params) do
    errors = []

    # Title is the only required field for initial puzzle creation
    {title, errors} =
      case Map.get(params, "title") do
        title when is_binary(title) ->
          trimmed = String.trim(title)

          if String.length(trimmed) in 4..128 do
            {trimmed, errors}
          else
            {nil, [%{field: "title", message: "must be between 4 and 128 characters"} | errors]}
          end

        _ ->
          {nil, [%{field: "title", message: "must be between 4 and 128 characters"} | errors]}
      end

    # All other fields are optional during creation - can be filled in step-by-step via edit
    statement =
      case Map.get(params, "description") do
        description when is_binary(description) ->
          trimmed = String.trim(description)
          if String.length(trimmed) >= 1, do: trimmed, else: nil

        _ ->
          nil
      end

    difficulty =
      case Map.get(params, "difficulty") do
        difficulty when is_binary(difficulty) ->
          value = String.downcase(String.trim(difficulty))
          Map.get(@allowed_difficulties, value)

        _ ->
          nil
      end

    validators =
      case Map.get(params, "validators") do
        validators when is_list(validators) and validators != [] ->
          parsed =
            Enum.reduce(validators, {[], [], 0}, fn
              %{"input" => input, "output" => output} = validator, {acc, errs, index} ->
                cond do
                  not is_binary(input) or input == "" ->
                    {acc,
                     [%{field: "validators", index: index, message: "input is required"} | errs],
                     index + 1}

                  not is_binary(output) or output == "" ->
                    {acc,
                     [%{field: "validators", index: index, message: "output is required"} | errs],
                     index + 1}

                  true ->
                    validator_map = %{
                      input: input,
                      output: output,
                      is_public: Map.get(validator, "isPublic", false)
                    }

                    {[validator_map | acc], errs, index + 1}
                end

              _validator, {acc, errs, index} ->
                {acc,
                 [
                   %{
                     field: "validators",
                     index: index,
                     message: "must be objects with input/output"
                   }
                   | errs
                 ], index + 1}
            end)

          case parsed do
            {acc, [], _} -> Enum.reverse(acc)
            {_acc, errs, _} -> {:error, errs}
          end

        _ ->
          []
      end

    # Check if validators parsing had errors
    errors =
      case validators do
        {:error, validator_errors} -> errors ++ validator_errors
        _ -> errors
      end

    validators = if is_list(validators), do: validators, else: []

    tags =
      params
      |> Map.get("tags")
      |> normalize_tags()

    constraints =
      params
      |> Map.get("constraints")
      |> normalize_optional_string()

    if errors == [] do
      puzzle_attrs =
        %{
          title: title,
          statement: statement,
          constraints: constraints,
          difficulty: difficulty,
          tags: tags,
          validators: validators,
          solution: %{}
        }
        |> Enum.reject(fn {_k, v} -> is_nil(v) or v == [] end)
        |> Enum.into(%{})

      {:ok, puzzle_attrs}
    else
      {:error, :invalid_payload, Enum.reverse(errors)}
    end
  end

  defp normalize_create_params(_),
    do: {:error, :invalid_payload, [%{message: "Expected JSON body"}]}

  defp normalize_update_params(params) when is_map(params) do
    # For updates, all fields are optional (only include what's being changed)
    errors = []

    # Title (optional for update, but if provided must be valid)
    {title, errors} =
      case Map.get(params, "title") do
        nil ->
          {nil, errors}

        title when is_binary(title) ->
          trimmed = String.trim(title)

          if String.length(trimmed) in 4..128 do
            {trimmed, errors}
          else
            {nil, [%{field: "title", message: "must be between 4 and 128 characters"} | errors]}
          end

        _ ->
          {nil, [%{field: "title", message: "must be a string"} | errors]}
      end

    # Statement/description (optional)
    statement =
      case Map.get(params, "description") do
        nil ->
          nil

        description when is_binary(description) ->
          trimmed = String.trim(description)
          if String.length(trimmed) >= 1, do: trimmed, else: nil

        _ ->
          nil
      end

    # Difficulty (optional)
    difficulty =
      case Map.get(params, "difficulty") do
        nil ->
          nil

        difficulty when is_binary(difficulty) ->
          value = String.downcase(String.trim(difficulty))
          Map.get(@allowed_difficulties, value)

        _ ->
          nil
      end

    # Visibility (optional)
    visibility =
      case Map.get(params, "visibility") do
        nil ->
          nil

        vis when is_binary(vis) ->
          normalized = String.upcase(String.trim(vis))
          if normalized in ["DRAFT", "PUBLIC", "PRIVATE"], do: normalized, else: nil

        _ ->
          nil
      end

    # Validators (optional, but if provided must be valid)
    validators =
      case Map.get(params, "validators") do
        nil ->
          nil

        validators when is_list(validators) and validators != [] ->
          parsed =
            Enum.reduce(validators, {[], [], 0}, fn
              %{"input" => input, "output" => output} = validator, {acc, errs, index} ->
                cond do
                  not is_binary(input) or input == "" ->
                    {acc,
                     [%{field: "validators", index: index, message: "input is required"} | errs],
                     index + 1}

                  not is_binary(output) or output == "" ->
                    {acc,
                     [%{field: "validators", index: index, message: "output is required"} | errs],
                     index + 1}

                  true ->
                    validator_map = %{
                      input: input,
                      output: output,
                      is_public: Map.get(validator, "isPublic", false)
                    }

                    {[validator_map | acc], errs, index + 1}
                end

              _validator, {acc, errs, index} ->
                {acc,
                 [
                   %{
                     field: "validators",
                     index: index,
                     message: "must be objects with input/output"
                   }
                   | errs
                 ], index + 1}
            end)

          case parsed do
            {acc, [], _} -> Enum.reverse(acc)
            {_acc, errs, _} -> {:error, errs}
          end

        [] ->
          []

        _ ->
          nil
      end

    # Check if validators parsing had errors
    errors =
      case validators do
        {:error, validator_errors} -> errors ++ validator_errors
        _ -> errors
      end

    validators = if is_list(validators), do: validators, else: nil

    # Tags (optional)
    tags =
      case Map.get(params, "tags") do
        nil -> nil
        tags_value -> normalize_tags(tags_value)
      end

    # Constraints (optional)
    constraints =
      case Map.get(params, "constraints") do
        nil -> nil
        constraints_value -> normalize_optional_string(constraints_value)
      end

    if errors == [] do
      puzzle_attrs =
        %{
          title: title,
          statement: statement,
          constraints: constraints,
          difficulty: difficulty,
          visibility: visibility,
          tags: tags,
          validators: validators
        }
        |> Enum.reject(fn {_k, v} -> is_nil(v) end)
        |> Enum.into(%{})

      {:ok, puzzle_attrs}
    else
      {:error, :invalid_payload, Enum.reverse(errors)}
    end
  end

  defp normalize_update_params(_),
    do: {:error, :invalid_payload, [%{message: "Expected JSON body"}]}

  # Authorization helper - checks if user can access/modify puzzle
  defp authorize_puzzle_access(%Puzzle{author_id: author_id}, user_id, _role)
       when author_id == user_id do
    :ok
  end

  defp authorize_puzzle_access(_puzzle, _user_id, "ADMIN"), do: :ok
  defp authorize_puzzle_access(_puzzle, _user_id, _role), do: {:error, :forbidden}

  defp normalize_tags(nil), do: []

  defp normalize_tags(tags) when is_list(tags) do
    tags
    |> Enum.filter(&is_binary/1)
    |> Enum.map(&String.trim/1)
    |> Enum.reject(&(&1 == ""))
  end

  defp normalize_tags(_), do: []

  defp normalize_optional_string(nil), do: nil
  defp normalize_optional_string(value) when is_binary(value), do: String.trim(value)
  defp normalize_optional_string(_), do: nil

  defp translate_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
  end
end
