defmodule CodinCod.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      CodinCodWeb.Telemetry,
      CodinCod.Repo,
      {DNSCluster, query: Application.get_env(:codin_cod, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: CodinCod.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: CodinCod.Finch},
      # Start a worker by calling: CodinCod.Worker.start_link(arg)
      # {CodinCod.Worker, arg},
      # Start to serve requests, typically the last entry
      CodinCodWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: CodinCod.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    CodinCodWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
