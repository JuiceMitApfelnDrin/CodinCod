defmodule CodincodApi.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      CodincodApiWeb.Telemetry,
      CodincodApi.Repo,
      {DNSCluster, query: Application.get_env(:codincod_api, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: CodincodApi.PubSub},
      # Phoenix.Presence for real-time player tracking in multiplayer
      CodincodApiWeb.Presence,
      {Finch, name: CodincodApiFinch},
      # Start a worker by calling: CodincodApi.Worker.start_link(arg)
      # {CodincodApi.Worker, arg},
      # Start to serve requests, typically the last entry
      CodincodApiWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: CodincodApi.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    CodincodApiWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
