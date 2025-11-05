defmodule Mix.Tasks.GenTypescriptTypes do
  @moduledoc "Legacy wrapper that delegates to `mix codincod.gen_types`."

  use Mix.Task

  @shortdoc "Generate TypeScript types (compat shortcut)"

  @impl Mix.Task
  def run(args) do
    Mix.Tasks.Codincod.GenTypes.run(args)
  end
end
