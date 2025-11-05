defmodule CodincodApiWeb.Plugs.CurrentUser do
  @moduledoc """
  Plug to assign the current authenticated user to the connection.
  """
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    case Guardian.Plug.current_resource(conn) do
      nil -> conn
      user -> assign(conn, :current_user, user)
    end
  end
end
