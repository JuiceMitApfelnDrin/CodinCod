defmodule CodincodApiWeb.Plugs.OpenApiSpec do
  @moduledoc """
  Wrapper plug to attach the generated OpenAPI spec to the connection.
  """

  @behaviour Plug

  @impl Plug
  def init(opts) do
    opts
    |> Keyword.put_new(:module, CodincodApiWeb.OpenAPI)
    |> OpenApiSpex.Plug.PutApiSpec.init()
  end

  @impl Plug
  def call(conn, opts) do
    OpenApiSpex.Plug.PutApiSpec.call(conn, opts)
  end
end
