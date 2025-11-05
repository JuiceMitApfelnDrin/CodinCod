defmodule CodincodApiWeb.Plugs.AttachTokenFromCookie do
  @moduledoc """
  Ensures Bearer tokens stored in cookies are exposed to Guardian pipelines.

  The legacy Fastify backend set an HTTP-only cookie named `token`. Since the
  frontend continues to rely on that behaviour, this plug mirrors it by
  promoting the cookie value to the `Authorization` header when a header is not
  already present.
  """

  import Plug.Conn

  @behaviour Plug

  @impl Plug
  def init(opts), do: opts

  @impl Plug
  def call(conn, _opts) do
    conn = fetch_cookies(conn)

    case {get_req_header(conn, "authorization"), Map.get(conn.req_cookies, cookie_name())} do
      {[], token} when is_binary(token) and byte_size(token) > 0 ->
        put_req_header(conn, "authorization", "Bearer " <> token)

      _ ->
        conn
    end
  end

  defp cookie_name do
    Application.get_env(:codincod_api, :auth_cookie, [])
    |> Keyword.get(:name, "token")
  end
end
