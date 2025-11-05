import Config

# Configure your database
#
# The MIX_TEST_PARTITION environment variable can be used
# to provide built-in test partitioning in CI environment.
# Run `mix help test` for more information.
test_db = System.get_env("POSTGRES_DB") || "codincod_api_test"
test_partition = System.get_env("MIX_TEST_PARTITION")

config :codincod_api, CodincodApi.Repo,
  username: System.get_env("POSTGRES_USER") || "postgres",
  password: System.get_env("POSTGRES_PASSWORD") || "postgres",
  hostname: System.get_env("POSTGRES_HOST") || "localhost",
  database: test_db <> (test_partition || ""),
  pool: Ecto.Adapters.SQL.Sandbox,
  pool_size: System.schedulers_online() * 2

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :codincod_api, CodincodApiWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "c7sts8bQHiU24YfV7shYKABl1vrkugz+Hc2rtgp6AzEWLPCgxinjIGiNG/dVHT0w",
  server: false

# In test we don't send emails
config :codincod_api, CodincodApi.Mailer, adapter: Swoosh.Adapters.Test

# Disable swoosh api client as it is only required for production adapters
config :swoosh, :api_client, false

# Use in-memory piston mock for tests
config :codincod_api, :piston_client, CodincodApi.Piston.Mock

# Print only warnings and errors during test
config :logger, level: :warning

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime

# PBKDF2 minimal cost for tests
config :pbkdf2_elixir, :rounds, 1
