defmodule CodincodApiWeb.OpenApiController do
  @moduledoc "Serves the OpenAPI specification."

  use CodincodApiWeb, :controller

  def show(conn, _params) do
    spec = CodincodApiWeb.OpenAPI.spec() |> OpenApiSpex.OpenApi.to_map()
    json(conn, spec)
  end
end
