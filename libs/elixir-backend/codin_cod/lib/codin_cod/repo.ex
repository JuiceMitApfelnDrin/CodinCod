defmodule CodinCod.Repo do
  use Ecto.Repo,
    otp_app: :codin_cod,
    adapter: Ecto.Adapters.Postgres
end
