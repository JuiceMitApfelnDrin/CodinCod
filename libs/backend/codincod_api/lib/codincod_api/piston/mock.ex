defmodule CodincodApi.Piston.Mock do
  @moduledoc """
  In-memory mock client used in tests to avoid hitting a real Piston instance.
  By default it echoes the provided stdin as stdout so validators expecting
  matching output succeed. Tests can override the behaviour by setting the
  `:piston_mock_execute` application environment to a `fun/1`.
  """

  @behaviour CodincodApi.Piston

  @impl CodincodApi.Piston
  def list_runtimes do
    {:ok,
     [
       %{
         "language" => "python",
         "version" => "3.10.0",
         "aliases" => ["py"],
         "runtime" => "cpython"
       }
     ]}
  end

  @impl CodincodApi.Piston
  def execute(request) when is_map(request) do
    case Application.get_env(:codincod_api, :piston_mock_execute) do
      fun when is_function(fun, 1) -> fun.(request)
      _ -> {:ok, default_success(request)}
    end
  end

  defp default_success(request) do
    stdin = Map.get(request, "stdin") || Map.get(request, :stdin) || ""

    %{
      "language" => Map.get(request, "language") || Map.get(request, :language) || "python",
      "version" => Map.get(request, "version") || Map.get(request, :version) || "3.10.0",
      "run" => %{
        "output" => to_string(stdin),
        "stdout" => to_string(stdin),
        "stderr" => "",
        "signal" => nil,
        "code" => 0
      }
    }
  end
end
