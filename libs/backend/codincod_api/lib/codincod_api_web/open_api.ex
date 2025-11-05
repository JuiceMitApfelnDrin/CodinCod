defmodule CodincodApiWeb.OpenAPI do
  @moduledoc """
  OpenAPI specification entry point for the CodinCod Phoenix backend.
  """

  alias OpenApiSpex.{Components, Info, OpenApi, Paths, Server}

  @spec spec() :: OpenApi.t()
  def spec do
    %OpenApi{
      info: %Info{
        title: "CodinCod API",
        version: "0.1.0",
        description: "Phoenix implementation of the CodinCod backend"
      },
      servers: [Server.from_endpoint(CodincodApiWeb.Endpoint)],
      paths: Paths.from_router(CodincodApiWeb.Router),
      components: components()
    }
    # Discover request/response schemas from path specs and resolve module references to $ref
    |> OpenApiSpex.resolve_schema_modules()
  end

  defp components do
    %Components{
      schemas: CodincodApiWeb.OpenAPI.Schemas.registry()
    }
  end
end
