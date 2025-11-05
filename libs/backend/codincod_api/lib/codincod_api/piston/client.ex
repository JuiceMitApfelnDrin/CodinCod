defmodule CodincodApi.Piston.Client do
  @moduledoc """
  Tesla-powered implementation that communicates with a Piston server.
  """

  @behaviour CodincodApi.Piston

  alias Tesla.Env

  @execute_path "/api/v2/execute"
  @runtimes_path "/api/v2/runtimes"

  @impl CodincodApi.Piston
  def list_runtimes do
    case Tesla.get(client(), @runtimes_path) do
      {:ok, %Env{status: status, body: body}} when status in 200..299 and is_list(body) ->
        {:ok, body}

      {:ok, %Env{status: status, body: body}} ->
        {:error, {:unexpected_status, status, body}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  @impl CodincodApi.Piston
  def execute(request) when is_map(request) do
    case Tesla.post(client(), @execute_path, request) do
      {:ok, %Env{status: status, body: body}} when status in 200..299 and is_map(body) ->
        {:ok, body}

      {:ok, %Env{status: status, body: body}} ->
        {:error, {:unexpected_status, status, body}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp client do
    middleware = [
      {Tesla.Middleware.BaseUrl, base_url()},
      Tesla.Middleware.JSON,
      {Tesla.Middleware.Timeout, timeout: 15_000}
    ]

    adapter = {Tesla.Adapter.Finch, name: CodincodApiFinch}

    Tesla.client(middleware, adapter)
  end

  defp base_url do
    config = Application.get_env(:codincod_api, :piston, [])
    Keyword.get(config, :base_url, "http://localhost:2000")
  end
end
