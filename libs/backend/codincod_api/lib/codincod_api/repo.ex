defmodule CodincodApi.Repo do
  use Ecto.Repo,
    otp_app: :codincod_api,
    adapter: Ecto.Adapters.Postgres
end
