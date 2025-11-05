defmodule Mix.Tasks.Codincod.GenTypes do
  @moduledoc "Generates TypeScript definitions that mirror the Phoenix backend."

  use Mix.Task

  @shortdoc "Generate TypeScript types for the frontend"

  @switches [dest: :string]
  @aliases [d: :dest]

  @impl Mix.Task
  def run(args) do
    Mix.Task.run("compile")

    {opts, _argv, _invalid} = OptionParser.parse(args, switches: @switches, aliases: @aliases)

    opts = Keyword.take(opts, [:dest])

    case CodincodApi.Typegen.generate(opts) do
      {:ok, path} ->
        Mix.shell().info("TypeScript definitions written to #{path}")

      {:error, reason} ->
        Mix.raise("Failed to generate TypeScript types: #{inspect(reason)}")
    end
  end
end
