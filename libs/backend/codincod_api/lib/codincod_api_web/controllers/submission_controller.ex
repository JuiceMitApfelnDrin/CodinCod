defmodule CodincodApiWeb.SubmissionController do
  @moduledoc """
  Handles submission creation and retrieval, mirroring the Fastify submission routes.
  """

  use CodincodApiWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Ecto.UUID

  alias CodincodApi.Accounts.User
  alias CodincodApi.{Languages, Puzzles, Repo, Submissions}
  alias CodincodApi.Puzzles.Puzzle
  alias CodincodApi.Languages.ProgrammingLanguage
  alias CodincodApi.Submissions.{Evaluator, Submission}
  alias CodincodApiWeb.OpenAPI.Schemas
  alias CodincodApiWeb.Serializers.{Helpers, SubmissionSerializer}

  action_fallback CodincodApiWeb.FallbackController

  tags(["Submission"])

  operation(:create,
    summary: "Submit code for evaluation",
    request_body:
      {"Submission payload", "application/json", Schemas.Submission.SubmitCodeRequest},
    responses: %{
      201 => {"Submission created", "application/json", Schemas.Submission.SubmitCodeResponse},
      400 => {"Invalid payload", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      403 => {"Forbidden", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Puzzle not found", "application/json", Schemas.Common.ErrorResponse},
      422 => {"Validation error", "application/json", Schemas.Common.ErrorResponse},
      503 => {"Execution unavailable", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def create(conn, params) do
    with %User{id: user_id} = user <- conn.assigns[:current_user] || {:error, :unauthorized},
         {:ok, attrs} <- normalize_submit_params(params, user_id),
         {:ok, puzzle} <- ensure_puzzle(attrs.puzzle_id),
         {:ok, language} <- ensure_language(attrs.programming_language_id),
         {:ok, evaluation} <- Evaluator.evaluate(attrs.code, puzzle, language),
         {:ok, submission} <-
           persist_submission(attrs, user, puzzle, language, evaluation.summary) do
      response = build_submit_response(submission, evaluation.summary)

      conn
      |> put_status(:created)
      |> json(response)
    else
      {:error, :unauthorized} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authenticated"})

      {:error, :user_mismatch} ->
        conn
        |> put_status(:forbidden)
        |> json(%{error: "Authenticated user does not match submission payload"})

      {:error, :invalid_payload, errors} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "Invalid submission payload", errors: errors})

      {:error, {:puzzle, :not_found}} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Puzzle not found"})

      {:error, {:puzzle, :no_validators}} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Failed to update the puzzle"})

      {:error, {:language, :not_found}} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Invalid programming language"})

      {:error, {:invalid_field, field, message}} ->
        conn
        |> put_status(:bad_request)
        |> json(%{
          message: "Invalid submission payload",
          errors: [%{field: field, message: message}]
        })

      {:error, %Ecto.Changeset{} = changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{message: "Failed to create submission", errors: translate_errors(changeset)})

      {:error, reason} ->
        handle_execution_error(conn, reason)
    end
  end

  operation(:show,
    summary: "Fetch submission by id",
    parameters: [
      id: [
        in: :path,
        description: "Submission identifier",
        schema: %OpenApiSpex.Schema{type: :string, format: :uuid}
      ]
    ],
    responses: %{
      200 => {"Submission", "application/json", Schemas.Submission.SubmissionResponse},
      400 => {"Invalid id", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      404 => {"Not found", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def show(conn, %{"id" => id}) do
    with %User{} <- conn.assigns[:current_user] || {:error, :unauthorized},
         {:ok, submission_id} <- cast_uuid(id, "id"),
         {:ok, submission} <-
           Submissions.fetch_submission(submission_id,
             preload: [:programming_language, :puzzle, :user]
           ) do
      conn
      |> put_status(:ok)
      |> json(SubmissionSerializer.render(submission))
    else
      {:error, :unauthorized} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authenticated"})

      {:error, {:invalid_field, field, message}} ->
        conn
        |> put_status(:bad_request)
        |> json(%{
          message: "Invalid submission identifier",
          errors: [%{field: field, message: message}]
        })

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> json(%{error: "Submission not found"})
    end
  end

  defp normalize_submit_params(params, current_user_id) when is_map(params) do
    with {:ok, _user_id} <- ensure_user_matches(Map.get(params, "userId"), current_user_id) do
      {code, errors} = validate_code(Map.get(params, "code"))
      {puzzle_id, errors} = validate_uuid(Map.get(params, "puzzleId"), "puzzleId", errors)

      {language_id, errors} =
        validate_uuid(Map.get(params, "programmingLanguageId"), "programmingLanguageId", errors)

      if errors == [] do
        {:ok,
         %{
           code: code,
           puzzle_id: puzzle_id,
           programming_language_id: language_id
         }}
      else
        {:error, :invalid_payload, errors}
      end
    end
  end

  defp normalize_submit_params(_params, _current_user_id), do: {:error, :invalid_payload, []}

  defp ensure_user_matches(nil, _current_user_id),
    do: {:error, {:invalid_field, "userId", "is required"}}

  defp ensure_user_matches(user_id, current_user_id) when is_binary(user_id) do
    with {:ok, uuid} <- cast_uuid(user_id, "userId") do
      if uuid == current_user_id do
        {:ok, uuid}
      else
        {:error, :user_mismatch}
      end
    end
  end

  defp ensure_user_matches(_user_id, _current_user_id),
    do: {:error, {:invalid_field, "userId", "must be a valid UUID"}}

  defp ensure_puzzle(puzzle_id) do
    case Puzzles.fetch_puzzle_with_validators(puzzle_id) do
      {:ok, %Puzzle{} = puzzle} ->
        puzzle = Repo.preload(puzzle, :validators)
        validators = Map.get(puzzle, :validators, [])

        if Enum.empty?(validators) do
          {:error, {:puzzle, :no_validators}}
        else
          {:ok, puzzle}
        end

      {:error, :not_found} ->
        {:error, {:puzzle, :not_found}}
    end
  end

  defp ensure_language(language_id) do
    case Languages.fetch_language(language_id) do
      {:ok, %ProgrammingLanguage{} = language} -> {:ok, language}
      {:error, :not_found} -> {:error, {:language, :not_found}}
    end
  end

  defp persist_submission(
         attrs,
         %User{id: user_id},
         %Puzzle{id: puzzle_id},
         %ProgrammingLanguage{id: language_id},
         summary
       ) do
    result_payload = build_result_payload(summary)

    attrs = %{
      code: attrs.code,
      puzzle_id: puzzle_id,
      user_id: user_id,
      programming_language_id: language_id,
      result: result_payload
    }

    case Submissions.create_submission(attrs) do
      {:ok, %Submission{} = submission} -> {:ok, submission}
      {:error, %Ecto.Changeset{} = changeset} -> {:error, changeset}
    end
  end

  defp validate_code(code) when is_binary(code) do
    if String.trim(code) == "" do
      {code, [%{field: "code", message: "must not be empty"}]}
    else
      {code, []}
    end
  end

  defp validate_code(_code), do: {nil, [%{field: "code", message: "must not be empty"}]}

  defp validate_uuid(value, field, errors) when is_binary(value) do
    case UUID.cast(value) do
      {:ok, uuid} -> {uuid, errors}
      :error -> {nil, [%{field: field, message: "must be a valid UUID"} | errors]}
    end
  end

  defp validate_uuid(_value, field, errors),
    do: {nil, [%{field: field, message: "must be a valid UUID"} | errors]}

  defp build_submit_response(%Submission{} = submission, summary) do
    code = submission.code || ""

    %{
      submissionId: submission.id,
      code: submission.code,
      puzzleId: submission.puzzle_id,
      programmingLanguageId: submission.programming_language_id,
      userId: submission.user_id,
      codeLength: String.length(code),
      result: %{
        successRate: summary.success_rate,
        passed: summary.passed,
        failed: summary.failed,
        total: summary.total
      },
      createdAt: Helpers.format_datetime(submission.inserted_at)
    }
  end

  defp build_result_payload(summary) do
    %{
      "result" => summary.result,
      "successRate" => summary.success_rate,
      "passed" => summary.passed,
      "failed" => summary.failed,
      "total" => summary.total
    }
  end

  defp handle_execution_error(conn, {:unexpected_status, status, _body}) do
    conn
    |> put_status(:bad_gateway)
    |> json(%{error: "Execution service error", status: status})
  end

  defp handle_execution_error(conn, reason) do
    conn
    |> put_status(:service_unavailable)
    |> json(%{error: "Execution service unavailable", reason: inspect(reason)})
  end

  defp cast_uuid(value, field) when is_binary(value) do
    case UUID.cast(value) do
      {:ok, uuid} -> {:ok, uuid}
      :error -> {:error, {:invalid_field, field, "must be a valid UUID"}}
    end
  end

  defp cast_uuid(_value, field), do: {:error, {:invalid_field, field, "must be a valid UUID"}}

  defp translate_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Enum.reduce(opts, msg, fn {key, value}, acc ->
        String.replace(acc, "%{#{key}}", to_string(value))
      end)
    end)
  end
end
