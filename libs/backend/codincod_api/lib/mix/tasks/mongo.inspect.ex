defmodule Mix.Tasks.Mongo.Inspect do
  @moduledoc """
  Inspects MongoDB database to show what data is available for migration.

  Usage:
    mix mongo.inspect
  """

  use Mix.Task
  require Logger

  @shortdoc "Inspect MongoDB database contents"

  def run(_args) do
    Mix.Task.run("app.start")

    # MongoDB connection from TypeScript backend env
    mongo_uri = System.get_env("MONGO_URI") || "mongodb://codincod-dev:hunter2@localhost:27017"
    mongo_db = System.get_env("MONGO_DB_NAME") || "codincod-development"

    Logger.info("Connecting to MongoDB: #{mongo_db}")
    Logger.info("URI: #{String.replace(mongo_uri, ~r/:[^:@]+@/, ":***@")}")

    # MongoDB Atlas requires SSL with CA certs
    ssl_opts = if String.contains?(mongo_uri, "mongodb+srv://") do
      [
        verify: :verify_none  # For development - disable cert verification
      ]
    else
      []
    end

    case Mongo.start_link(url: mongo_uri, name: :mongo, database: mongo_db, pool_size: 2, ssl_opts: ssl_opts) do
      {:ok, _pid} ->
        inspect_database(mongo_db)
        # Don't call Mongo.stop - just let it terminate naturally
        :ok
      {:error, reason} ->
        Logger.error("Failed to connect to MongoDB: #{inspect(reason)}")
        Logger.error("Make sure MongoDB is running and MONGO_URI is correct")
    end
  end

  defp inspect_database(database) do
    IO.puts("\n" <> IO.ANSI.cyan() <> "=== MongoDB Database: #{database} ===" <> IO.ANSI.reset() <> "\n")

    collections = [
      "users",
      "puzzles",
      "submissions",
      "games",
      "programming_languages",
      "programmingLanguages",
      "comments",
      "reports",
      "user_metrics",
      "usermetrics",
      "preferences"
    ]

    Enum.each(collections, fn collection ->
      count = count_documents(collection)

      if count > 0 do
        IO.puts("#{IO.ANSI.green()}✓#{IO.ANSI.reset()} #{String.pad_trailing(collection, 25)} #{IO.ANSI.yellow()}#{count}#{IO.ANSI.reset()} documents")

        # Show sample document
        case Mongo.find_one(:mongo, collection, %{}) do
          nil -> :ok
          doc ->
            IO.puts("   Sample keys: #{inspect(Map.keys(doc) |> Enum.take(10))}")
        end
      else
        IO.puts("#{IO.ANSI.red()}✗#{IO.ANSI.reset()} #{String.pad_trailing(collection, 25)} (empty)")
      end
    end)

    IO.puts("\n")
  end

  defp count_documents(collection) do
    case Mongo.count_documents(:mongo, collection, %{}) do
      {:ok, count} -> count
      _ -> 0
    end
  rescue
    _ -> 0
  end
end
