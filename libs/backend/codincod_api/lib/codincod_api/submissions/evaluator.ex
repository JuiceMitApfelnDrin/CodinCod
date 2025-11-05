defmodule CodincodApi.Submissions.Evaluator do
  @moduledoc """
  Executes puzzle validators against the Piston service and collates the
  resulting success metrics used when creating submissions.
  """

  alias CodincodApi.Languages.ProgrammingLanguage
  alias CodincodApi.Puzzles.{Puzzle, PuzzleValidator}

  @type evaluation_summary :: %{
          passed: non_neg_integer(),
          failed: non_neg_integer(),
          total: non_neg_integer(),
          success_rate: float(),
          result: String.t()
        }

  @type evaluation_result :: %{
          summary: evaluation_summary(),
          responses: [{PuzzleValidator.t(), map()}]
        }

  @default_timeout 20_000

  @spec evaluate(String.t(), Puzzle.t(), ProgrammingLanguage.t(), keyword()) ::
          {:ok, evaluation_result()} | {:error, term()}
  def evaluate(code, %Puzzle{} = puzzle, %ProgrammingLanguage{} = language, opts \\ [])
      when is_binary(code) do
    validators = puzzle.validators || []

    cond do
      validators == [] ->
        {:error, :no_validators}

      true ->
        with {:ok, runtime} <- resolve_runtime(language),
             {:ok, responses} <- run_validators(code, runtime, validators, opts),
             {:ok, summary} <- summarise(responses) do
          {:ok, %{summary: summary, responses: responses}}
        end
    end
  end

  defp resolve_runtime(%ProgrammingLanguage{version: nil}) do
    {:error, :missing_version}
  end

  defp resolve_runtime(%ProgrammingLanguage{} = language) do
    runtime_language = language.runtime || language.language

    if runtime_language do
      {:ok,
       %{
         language: runtime_language,
         version: language.version
       }}
    else
      {:error, :missing_runtime}
    end
  end

  defp run_validators(code, runtime, validators, opts) do
    timeout = Keyword.get(opts, :timeout, @default_timeout)
    concurrency = Keyword.get(opts, :max_concurrency, System.schedulers_online())

    validators
    |> Task.async_stream(
      fn validator ->
        inputs = build_request(runtime, code, validator)

        case CodincodApi.Piston.execute(inputs) do
          {:ok, response} -> {:ok, {validator, response}}
          {:error, reason} -> {:error, reason}
        end
      end,
      timeout: timeout,
      max_concurrency: concurrency,
      ordered: true
    )
    |> Enum.reduce_while({:ok, []}, fn
      {:ok, {:ok, result}}, {:ok, acc} -> {:cont, {:ok, [result | acc]}}
      {:ok, {:error, reason}}, _ -> {:halt, {:error, reason}}
      {:exit, reason}, _ -> {:halt, {:error, reason}}
    end)
    |> case do
      {:ok, responses} -> {:ok, Enum.reverse(responses)}
      {:error, reason} -> {:error, reason}
    end
  end

  defp build_request(runtime, code, validator) do
    %{
      "language" => runtime.language,
      "version" => runtime.version,
      "files" => [%{"content" => code}],
      "stdin" => validator.input || ""
    }
  end

  defp summarise(responses) when is_list(responses) do
    total = length(responses)

    {passed, failed} =
      Enum.reduce(responses, {0, 0}, fn {validator, response}, {p_acc, f_acc} ->
        if successful?(validator, response) do
          {p_acc + 1, f_acc}
        else
          {p_acc, f_acc + 1}
        end
      end)

    success_rate = if total > 0, do: passed / total, else: 0.0

    summary = %{
      passed: passed,
      failed: failed,
      total: total,
      success_rate: success_rate,
      result: if(failed == 0 and total > 0, do: "success", else: "error")
    }

    {:ok, summary}
  end

  defp successful?(%PuzzleValidator{output: expected}, response) do
    cond do
      not is_map(response) ->
        false

      is_integer(get_in(response, ["run", "code"])) and get_in(response, ["run", "code"]) != 0 ->
        false

      true ->
        actual_output =
          (get_in(response, ["run", "output"]) || get_in(response, ["run", "stdout"]) || "")
          |> to_string()

        compare_outputs(expected, actual_output)
    end
  end

  defp compare_outputs(nil, actual), do: String.trim_trailing(actual) == ""

  defp compare_outputs(expected, actual) do
    String.trim_trailing(to_string(expected)) == String.trim_trailing(actual)
  end
end
