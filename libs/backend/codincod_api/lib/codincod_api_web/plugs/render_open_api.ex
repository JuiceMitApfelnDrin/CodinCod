defmodule CodincodApiWeb.Plugs.RenderOpenApi do
  @moduledoc """
  Wrapper plug to render the OpenAPI specification.
  """

  @behaviour Plug

  @impl Plug
  def init(opts) do
    Keyword.put_new(opts, :json_library, Jason)
    |> OpenApiSpex.Plug.RenderSpec.init()
  end

  @impl Plug
  def call(conn, opts) do
    OpenApiSpex.Plug.RenderSpec.call(conn, opts)
  end
end
