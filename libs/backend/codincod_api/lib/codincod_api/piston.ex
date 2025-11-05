defmodule CodincodApi.Piston do
  @moduledoc """
  Facade module for interacting with the Piston execution service. The concrete
  client module can be swapped in configuration via the
  `:codincod_api, :piston_client` setting which defaults to
  `CodincodApi.Piston.Client`.
  """

  @typedoc "Represents a single language runtime entry exposed by Piston."
  @type runtime :: %{
          required(:language) => String.t(),
          required(:version) => String.t(),
          optional(:aliases) => list(String.t()),
          optional(:runtime) => String.t()
        }

  @typedoc "Response map returned by Piston's execute endpoint."
  @type execution_response :: map()

  @callback list_runtimes() :: {:ok, [runtime()]} | {:error, term()}
  @callback execute(map()) :: {:ok, execution_response()} | {:error, term()}

  @doc "Returns the list of Piston runtimes available for code execution."
  @spec list_runtimes() :: {:ok, [runtime()]} | {:error, term()}
  def list_runtimes do
    client().list_runtimes()
  end

  @doc "Executes code by delegating to the configured client module."
  @spec execute(map()) :: {:ok, execution_response()} | {:error, term()}
  def execute(request) when is_map(request) do
    client().execute(request)
  end

  defp client do
    Application.get_env(:codincod_api, :piston_client, CodincodApi.Piston.Client)
  end
end
