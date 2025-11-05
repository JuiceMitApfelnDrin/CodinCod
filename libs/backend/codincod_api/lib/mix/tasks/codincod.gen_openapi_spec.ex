defmodule Mix.Tasks.Codincod.GenOpenapiSpec do
  @moduledoc "Generate OpenAPI specification JSON from the Phoenix router."

  use Mix.Task

  @shortdoc "Emit OpenAPI JSON"

  @switches [dest: :string]
  @aliases [d: :dest]

  @impl Mix.Task
  def run(args) do
    Mix.Task.run("app.start")

    {opts, _argv, _invalid} = OptionParser.parse(args, switches: @switches, aliases: @aliases)

    dest =
      opts
      |> Keyword.get(:dest, default_destination())
      |> Path.expand(File.cwd!())

    spec = CodincodApiWeb.OpenAPI.spec()

    # Use render_spec instead of to_map to properly resolve references
    json = spec
    |> OpenApiSpex.OpenApi.json_encoder().encode!(pretty: true)

    :ok = File.mkdir_p!(Path.dirname(dest))
    :ok = File.write(dest, json)

    Mix.shell().info("OpenAPI spec written to #{dest}")
  end

  defp default_destination do
    Path.join(["priv", "static", "openapi.json"])
  end
end
