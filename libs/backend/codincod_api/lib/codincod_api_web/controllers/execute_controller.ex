defmodule CodincodApiWeb.ExecuteController do
  @moduledoc """
  Handles code execution without persistence, allowing users to test code
  against custom inputs before creating submissions.
  """

  use CodincodApiWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias CodincodApi.Accounts.User
  alias CodincodApi.Piston
  alias CodincodApiWeb.OpenAPI.Schemas

  action_fallback CodincodApiWeb.FallbackController

  tags(["Execute"])

  operation(:create,
    summary: "Execute code without saving",
    description: "Runs code against Piston with custom test input/output for validation",
    request_body: {"Execute request", "application/json", Schemas.Execute.ExecuteRequest},
    responses: %{
      200 => {"Execution result", "application/json", Schemas.Execute.ExecuteResponse},
      400 => {"Invalid request", "application/json", Schemas.Common.ErrorResponse},
      401 => {"Unauthorized", "application/json", Schemas.Common.ErrorResponse},
      503 => {"Service unavailable", "application/json", Schemas.Common.ErrorResponse}
    }
  )

  def create(conn, params) do
    with %User{} <- conn.assigns[:current_user] || {:error, :unauthorized},
         {:ok, attrs} <- normalize_execute_params(params),
         {:ok, runtimes} <- Piston.list_runtimes(),
         {:ok, runtime} <- find_runtime(runtimes, attrs.language),
         {:ok, execution_result} <- execute_code(runtime, attrs) do
      result = calculate_result(execution_result, attrs.test_output)

      response = %{
        run: execution_result["run"],
        compile: execution_result["compile"],
        puzzleResultInformation: result
      }

      conn
      |> put_status(:ok)
      |> json(response)
    else
      {:error, :unauthorized} ->
        conn
        |> put_status(:unauthorized)
        |> json(%{message: "Not authenticated"})

      {:error, :invalid_payload, errors} ->
        conn
        |> put_status(:bad_request)
        |> json(%{message: "Invalid execution payload", errors: errors})

      {:error, :runtime_not_found} ->
        conn
        |> put_status(:bad_request)
        |> json(%{
          error: "Unsupported language",
          message: "At the moment we don't support this language."
        })

      {:error, :service_unavailable} ->
        conn
        |> put_status(:service_unavailable)
        |> json(%{
          error: "Internal server error",
          message: "Network error occurred"
        })

      {:error, reason} ->
        conn
        |> put_status(:internal_server_error)
        |> json(%{
          error: "Internal server error",
          message: "Something went wrong",
          reason: inspect(reason)
        })
    end
  end

  defp normalize_execute_params(params) when is_map(params) do
    {code, errors} = validate_required_string(Map.get(params, "code"), "code")
    {language, errors} = validate_required_string(Map.get(params, "language"), "language", errors)
    test_input = Map.get(params, "testInput", "")
    test_output = Map.get(params, "testOutput", "")

    if errors == [] do
      {:ok,
       %{
         code: code,
         language: language,
         test_input: test_input,
         test_output: test_output
       }}
    else
      {:error, :invalid_payload, errors}
    end
  end

  defp normalize_execute_params(_params), do: {:error, :invalid_payload, []}

  defp validate_required_string(value, field, errors \\ [])

  defp validate_required_string(value, field, errors) when is_binary(value) do
    if String.trim(value) == "" do
      {nil, [%{field: field, message: "cannot be empty"} | errors]}
    else
      {value, errors}
    end
  end

  defp validate_required_string(_value, field, errors),
    do: {nil, [%{field: field, message: "is required"} | errors]}

  defp find_runtime(runtimes, language) when is_list(runtimes) and is_binary(language) do
    normalized = String.downcase(language)

    runtime =
      Enum.find(runtimes, fn rt ->
        runtime_lang = Map.get(rt, "language") || Map.get(rt, :language)
        runtime_lang && String.downcase(to_string(runtime_lang)) == normalized
      end)

    case runtime do
      nil -> {:error, :runtime_not_found}
      rt -> {:ok, rt}
    end
  end

  defp find_runtime(_runtimes, _language), do: {:error, :runtime_not_found}

  defp execute_code(runtime, attrs) do
    request = %{
      "language" => Map.get(runtime, "language") || Map.get(runtime, :language),
      "version" => Map.get(runtime, "version") || Map.get(runtime, :version),
      "files" => [%{"content" => attrs.code}],
      "stdin" => attrs.test_input
    }

    case Piston.execute(request) do
      {:ok, result} ->
        if is_successful_execution?(result) do
          {:ok, result}
        else
          {:error, {:piston_error, result}}
        end

      {:error, _reason} ->
        {:error, :service_unavailable}
    end
  end

  defp is_successful_execution?(result) when is_map(result) do
    # Piston returns successful executions with run.code == 0 or similar structure
    # We consider it successful if we got a response (errors are in the response itself)
    Map.has_key?(result, "run") || Map.has_key?(result, :run)
  end

  defp is_successful_execution?(_result), do: false

  defp calculate_result(execution_result, expected_output) do
    run = execution_result["run"] || execution_result[:run] || %{}
    output = run["output"] || run["stdout"] || run[:output] || run[:stdout] || ""
    exit_code = run["code"] || run[:code] || 0

    passed =
      if exit_code == 0 do
        trimmed_output = String.trim_trailing(to_string(output))
        trimmed_expected = String.trim_trailing(to_string(expected_output))
        if trimmed_output == trimmed_expected, do: 1, else: 0
      else
        0
      end

    failed = 1 - passed
    success_rate = if passed == 1, do: 1.0, else: 0.0

    %{
      result: if(passed == 1, do: "SUCCESS", else: "ERROR"),
      successRate: success_rate,
      passed: passed,
      failed: failed,
      total: 1
    }
  end
end
