import Config

# config/runtime.exs is executed for all environments, including
# during releases. It is executed after compilation and before the
# system starts, so it is typically used to load production configuration
# and secrets from environment variables or elsewhere. Do not define
# any compile-time configuration in here, as it won't be applied.

# ## Using releases
#
# If you use `mix release`, you need to explicitly enable the server
# by passing the PHX_SERVER=true when you start it:
#
#     PHX_SERVER=true bin/codincod_api start
#
# Alternatively, you can use `mix phx.gen.release` to generate a `bin/server`
# script that automatically sets the env var above.
if System.get_env("PHX_SERVER") do
  config :codincod_api, CodincodApiWeb.Endpoint, server: true
end

if config_env() == :prod do
  database_url =
    System.get_env("DATABASE_URL") ||
      raise """
      environment variable DATABASE_URL is missing.
      For example: ecto://USER:PASS@HOST/DATABASE
      """

  maybe_ipv6 = if System.get_env("ECTO_IPV6") in ~w(true 1), do: [:inet6], else: []

  config :codincod_api, CodincodApi.Repo,
    ssl: System.get_env("DATABASE_SSL") == "true",
    url: database_url,
    pool_size: String.to_integer(System.get_env("POOL_SIZE") || "10"),
    socket_options: maybe_ipv6

  # The secret key base is used to sign/encrypt cookies and other secrets.
  secret_key_base =
    System.get_env("SECRET_KEY_BASE") ||
      raise """
      environment variable SECRET_KEY_BASE is missing.
      You can generate one by calling: mix phx.gen.secret
      """

  host = System.get_env("PHX_HOST") || "example.com"
  port = String.to_integer(System.get_env("PORT") || "4000")

  config :codincod_api, :dns_cluster_query, System.get_env("DNS_CLUSTER_QUERY")

  config :codincod_api, CodincodApiWeb.Endpoint,
    url: [host: host, port: 443, scheme: "https"],
    http: [
      ip: {0, 0, 0, 0, 0, 0, 0, 0},
      port: port
    ],
    secret_key_base: secret_key_base

  # Guardian JWT configuration
  config :codincod_api, CodincodApiWeb.Auth.Guardian,
    issuer: System.get_env("JWT_ISSUER") || "codincod_api",
    secret_key: System.get_env("JWT_SECRET") || secret_key_base

  # Piston API configuration
  config :codincod_api, :piston, base_url: System.get_env("PISTON_URI") || "http://localhost:2000"

  # CORS configuration
  config :cors_plug,
    origin: String.split(System.get_env("CORS_ALLOWED_ORIGINS") || "http://localhost:5173", ",")

  # Mailer configuration
  mailer_adapter = System.get_env("MAILER_ADAPTER") || "local"

  mailer_module =
    case mailer_adapter do
      "sendgrid" -> Swoosh.Adapters.Sendgrid
      "mailgun" -> Swoosh.Adapters.Mailgun
      "smtp" -> Swoosh.Adapters.SMTP
      _ -> Swoosh.Adapters.Local
    end

  config :codincod_api, CodincodApi.Mailer, adapter: mailer_module

  # Rate limiting configuration
  if System.get_env("RATE_LIMIT_ENABLED") == "true" do
    config :hammer,
      backend:
        {Hammer.Backend.ETS,
         [
           expiry_ms: 60_000 * 60 * 4,
           cleanup_interval_ms: 60_000 * 10
         ]}
  end
end
