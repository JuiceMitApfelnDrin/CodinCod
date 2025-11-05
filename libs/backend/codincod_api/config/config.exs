# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :codincod_api,
  ecto_repos: [CodincodApi.Repo],
  generators: [timestamp_type: :utc_datetime, binary_id: true]

# Configures the endpoint
config :codincod_api, CodincodApiWeb.Endpoint,
  url: [host: "localhost"],
  adapter: Bandit.PhoenixAdapter,
  render_errors: [
    formats: [json: CodincodApiWeb.ErrorJSON],
    layout: false
  ],
  pubsub_server: CodincodApi.PubSub,
  live_view: [signing_salt: "H/Z/XSwb"]

# Configures the mailer
#
# By default it uses the "Local" adapter which stores the emails
# locally. You can see the emails in your browser, at "/dev/mailbox".
#
# For production it's recommended to configure a different adapter
# at the `config/runtime.exs`.
config :codincod_api, CodincodApi.Mailer, adapter: Swoosh.Adapters.Local

# Configure Guardian for JWT authentication
config :codincod_api, CodincodApiWeb.Auth.Guardian,
  issuer: "codincod_api",
  secret_key: "your_guardian_secret_key_here_change_in_runtime"

# Password hashing configuration
config :codincod_api, :password_adapter, Pbkdf2

# Runtime environment hints
config :codincod_api, :runtime_env, config_env()

# Authentication cookie defaults
config :codincod_api, :auth_cookie,
  name: "token",
  max_age: 7 * 24 * 60 * 60

# Default Piston client implementation
config :codincod_api, :piston_client, CodincodApi.Piston.Client

# Configure Oban for background jobs
config :codincod_api, Oban,
  engine: Oban.Engines.Basic,
  queues: [default: 10, mailer: 5, events: 20],
  repo: CodincodApi.Repo

# Configure Tesla HTTP client
config :tesla, adapter: Tesla.Adapter.Finch

# Configure Hammer for rate limiting
config :hammer,
  backend: {Hammer.Backend.ETS, [expiry_ms: 60_000 * 60 * 4, cleanup_interval_ms: 60_000 * 10]}

# Configures Elixir's Logger
config :logger, :default_formatter,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id, :user_id, :remote_ip]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
