defmodule Mix.Tasks.MigrateMongo do
  @moduledoc """
  Migrates data from MongoDB to PostgreSQL.

  This task is idempotent and can be safely re-run multiple times.
  It will skip already-migrated records based on legacy_mongo_id.

  ## Usage

      # Migrate everything (recommended order)
      mix migrate_mongo

      # Migrate specific collections
      mix migrate_mongo --only users
      mix migrate_mongo --only puzzles
      mix migrate_mongo --only submissions

      # Dry run (show what would be migrated)
      mix migrate_mongo --dry-run

      # Validate migration without migrating
      mix migrate_mongo --validate

  ## Environment Variables

      MONGO_URI - MongoDB connection string
      MONGO_DB_NAME - MongoDB database name (default: codincod-development)

  ## Migration Order (important!)

      1. Users (no dependencies)
      2. Puzzles (depends on users for author_id)
      3. Submissions (depends on users and puzzles)
      4. Games (depends on users and puzzles)
      5. Comments (depends on users and puzzles)
      6. Reports (depends on users)
      7. Preferences (depends on users)
  """

  use Mix.Task
  require Logger

  alias CodincodApi.Repo
  alias CodincodApi.Accounts.{User, Preference}
  alias CodincodApi.Puzzles.{Puzzle, PuzzleTestCase, PuzzleExample}
  alias CodincodApi.Submissions.Submission
  alias CodincodApi.Games.Game
  alias CodincodApi.Comments.Comment
  alias CodincodApi.Moderation.Report

  @shortdoc "Migrates data from MongoDB to PostgreSQL"

  @batch_size 100

  def run(args) do
    Mix.Task.run("app.start")

    {opts, _, _} = OptionParser.parse(args,
      switches: [only: :string, dry_run: :boolean, validate: :boolean],
      aliases: [o: :only, d: :dry_run, v: :validate]
    )

    mongo_uri = System.get_env("MONGO_URI") ||
                raise "MONGO_URI environment variable required"
    mongo_db = System.get_env("MONGO_DB_NAME") || "codincod-development"

    ssl_opts = if String.contains?(mongo_uri, "mongodb+srv://") do
      [verify: :verify_none]
    else
      []
    end

    Logger.info("🚀 Starting MongoDB → PostgreSQL migration")
    Logger.info("   Database: #{mongo_db}")

    case Mongo.start_link(url: mongo_uri, name: :mongo_migration, database: mongo_db, pool_size: 5, ssl_opts: ssl_opts) do
      {:ok, _pid} ->
        cond do
          opts[:validate] ->
            validate_migration()
          opts[:dry_run] ->
            dry_run(opts[:only])
          true ->
            perform_migration(opts[:only])
        end

      {:error, reason} ->
        Logger.error("❌ Failed to connect to MongoDB: #{inspect(reason)}")
        exit(:mongodb_connection_failed)
    end
  end

  defp perform_migration(only) do
    migrations = case only do
      "users" -> [:users]
      "puzzles" -> [:puzzles]
      "submissions" -> [:submissions]
      "games" -> [:games]
      "comments" -> [:comments]
      "reports" -> [:reports]
      "preferences" -> [:preferences]
      nil -> [:users, :puzzles, :submissions, :games, :comments, :reports, :preferences]
      _ ->
        Logger.error("Unknown collection: #{only}")
        exit(:invalid_collection)
    end

    start_time = System.monotonic_time(:millisecond)

    results = Enum.map(migrations, fn migration ->
      case migration do
        :users -> migrate_users()
        :puzzles -> migrate_puzzles()
        :submissions -> migrate_submissions()
        :games -> migrate_games()
        :comments -> migrate_comments()
        :reports -> migrate_reports()
        :preferences -> migrate_preferences()
      end
    end)

    duration = System.monotonic_time(:millisecond) - start_time

    Logger.info("\n" <> IO.ANSI.green() <> "✅ Migration completed in #{duration}ms" <> IO.ANSI.reset())
    print_summary(results)
  end

  defp migrate_users do
    Logger.info("\n📊 Migrating users...")

    case Mongo.find(:mongo_migration, "users", %{}) |> Enum.to_list() do
      [] ->
        Logger.warning("   No users found in MongoDB")
        %{collection: "users", migrated: 0, skipped: 0, failed: 0}

      mongo_users ->
        total = length(mongo_users)
        Logger.info("   Found #{total} users in MongoDB")

        {migrated, skipped, failed} = mongo_users
        |> Enum.chunk_every(@batch_size)
        |> Enum.with_index(1)
        |> Enum.reduce({0, 0, 0}, fn {batch, batch_num}, {m, s, f} ->
          Logger.info("   Processing batch #{batch_num}/#{ceil(total / @batch_size)}")

          Enum.reduce(batch, {m, s, f}, fn user, {migrated, skipped, failed} ->
            case migrate_single_user(user) do
              {:ok, :created} -> {migrated + 1, skipped, failed}
              {:ok, :skipped} -> {migrated, skipped + 1, failed}
              {:error, _} -> {migrated, skipped, failed + 1}
            end
          end)
        end)

        Logger.info("   ✓ Users: #{migrated} migrated, #{skipped} skipped, #{failed} failed")
        %{collection: "users", migrated: migrated, skipped: skipped, failed: failed, total: total}
    end
  end

  defp migrate_single_user(mongo_user) do
    mongo_id = extract_mongo_id(mongo_user["_id"])

    # Check if already migrated
    case Repo.get_by(User, legacy_id: mongo_id) do
      %User{} = _existing ->
        {:ok, :skipped}

      nil ->
        # Build profile from MongoDB structure
        profile = %{}
        |> Map.put("avatarUrl", get_in(mongo_user, ["profile", "avatarUrl"]) || get_in(mongo_user, ["profile", "picture"]))
        |> Map.put("bio", get_in(mongo_user, ["profile", "bio"]))
        |> Map.put("location", get_in(mongo_user, ["profile", "location"]))
        |> Enum.reject(fn {_k, v} -> is_nil(v) end)
        |> Enum.into(%{})

        # Sanitize username to match regex ^[A-Za-z0-9_-]+$
        raw_username = mongo_user["username"] || mongo_user["email"] |> String.split("@") |> hd()
        sanitized_username = raw_username
        |> String.replace(~r/[^A-Za-z0-9_-]/, "_")
        |> String.slice(0, 20)

        attrs = %{
          email: mongo_user["email"],
          username: sanitized_username,
          password: "TemporaryPassword123!",  # Will use actual hash below
          password_confirmation: "TemporaryPassword123!",
          profile: profile,
          role: parse_role(mongo_user["role"]),
          legacy_id: mongo_id,
          legacy_username: raw_username,  # Store original username
          ban_count: mongo_user["banCount"] || 0
        }

        changeset = User.registration_changeset(%User{}, attrs)

        # Override the password_hash with the actual MongoDB hash
        changeset = if mongo_user["password"] do
          Ecto.Changeset.put_change(changeset, :password_hash, mongo_user["password"])
        else
          changeset
        end

        # Set timestamps
        changeset = changeset
        |> Ecto.Changeset.put_change(:inserted_at, parse_datetime(mongo_user["createdAt"]) || DateTime.utc_now())
        |> Ecto.Changeset.put_change(:updated_at, parse_datetime(mongo_user["updatedAt"]) || DateTime.utc_now())

        case Repo.insert(changeset) do
          {:ok, _user} ->
            {:ok, :created}

          {:error, changeset} ->
            Logger.error("   Failed to migrate user #{mongo_user["email"]}: #{inspect(changeset.errors)}")
            {:error, changeset}
        end
    end
  end

  defp migrate_puzzles do
    Logger.info("\n🧩 Migrating puzzles...")

    case Mongo.find(:mongo_migration, "puzzles", %{}) |> Enum.to_list() do
      [] ->
        Logger.warning("   No puzzles found")
        %{collection: "puzzles", migrated: 0, skipped: 0, failed: 0}

      mongo_puzzles ->
        total = length(mongo_puzzles)
        Logger.info("   Found #{total} puzzles")

        {migrated, skipped, failed} = mongo_puzzles
        |> Enum.chunk_every(@batch_size)
        |> Enum.with_index(1)
        |> Enum.reduce({0, 0, 0}, fn {batch, batch_num}, {m, s, f} ->
          Logger.info("   Processing batch #{batch_num}/#{ceil(total / @batch_size)}")

          Enum.reduce(batch, {m, s, f}, fn puzzle, {migrated, skipped, failed} ->
            case migrate_single_puzzle(puzzle) do
              {:ok, :created} -> {migrated + 1, skipped, failed}
              {:ok, :skipped} -> {migrated, skipped + 1, failed}
              {:error, _} -> {migrated, skipped, failed + 1}
            end
          end)
        end)

        Logger.info("   ✓ Puzzles: #{migrated} migrated, #{skipped} skipped, #{failed} failed")
        %{collection: "puzzles", migrated: migrated, skipped: skipped, failed: failed, total: total}
    end
  end

  defp migrate_single_puzzle(mongo_puzzle) do
    mongo_id = extract_mongo_id(mongo_puzzle["_id"])

    case Repo.get_by(Puzzle, legacy_id: mongo_id) do
      %Puzzle{} -> {:ok, :skipped}
      nil ->
        # Find author by legacy_id
        author_mongo_id = extract_mongo_id(mongo_puzzle["author"])
        author = Repo.get_by(User, legacy_id: author_mongo_id)

        if is_nil(author) do
          Logger.warning("   Skipping puzzle '#{mongo_puzzle["title"]}' - author not found (#{author_mongo_id})")
          {:error, :author_not_found}
        else
          # Clean solution field from BSON ObjectIds
          solution = clean_bson_objectids(mongo_puzzle["solution"] || %{})

          attrs = %{
            title: mongo_puzzle["title"] || "Untitled Puzzle",
            statement: mongo_puzzle["statement"] || mongo_puzzle["description"] || "",
            constraints: mongo_puzzle["constraints"],
            difficulty: parse_difficulty(mongo_puzzle["difficulty"]),
            visibility: parse_visibility(mongo_puzzle["visibility"]),
            tags: mongo_puzzle["tags"] || [],
            solution: solution,
            author_id: author.id,
            legacy_id: mongo_id
          }

          changeset = Puzzle.changeset(%Puzzle{}, attrs)

          # Set timestamps
          changeset = changeset
          |> Ecto.Changeset.put_change(:inserted_at, parse_datetime(mongo_puzzle["createdAt"]) || DateTime.utc_now())
          |> Ecto.Changeset.put_change(:updated_at, parse_datetime(mongo_puzzle["updatedAt"]) || DateTime.utc_now())

          case Repo.insert(changeset) do
            {:ok, puzzle} ->
              # Migrate test cases to their own table
              # Validators can be at top level or in solution field
              migrate_test_cases(puzzle, mongo_puzzle, solution, mongo_id)

              # Migrate examples to their own table
              migrate_examples(puzzle, solution, mongo_id)

              {:ok, :created}
            {:error, changeset} ->
              Logger.error("   Failed to migrate puzzle '#{mongo_puzzle["title"]}': #{inspect(changeset.errors)}")
              {:error, changeset}
          end
        end
    end
  end

  defp migrate_test_cases(puzzle, mongo_puzzle, solution, mongo_id) do
    # MongoDB stores test cases in "validators" array at top level
    # Also check solution field and "testCases" for backward compatibility
    test_cases = mongo_puzzle["validators"] || solution["testCases"] || solution["validators"] || []

    test_cases
    |> Enum.with_index()
    |> Enum.each(fn {tc, idx} ->
      # Check if already exists by legacy_id
      legacy_id = "#{mongo_id}_tc_#{idx}"

      unless Repo.get_by(PuzzleTestCase, legacy_id: legacy_id) do
        attrs = %{
          puzzle_id: puzzle.id,
          input: tc["input"] || "",
          # MongoDB uses "output", newer format might use "expectedOutput"
          expected_output: tc["expectedOutput"] || tc["output"] || "",
          # Default to false if not specified (hidden test cases)
          is_sample: tc["isSample"] || tc["is_sample"] || false,
          order: idx,
          legacy_id: legacy_id,
          metadata: %{}
        }

        case PuzzleTestCase.changeset(%PuzzleTestCase{}, attrs) |> Repo.insert() do
          {:ok, _} -> :ok
          {:error, changeset} ->
            Logger.warning("   Failed to migrate test case #{idx} for puzzle #{puzzle.title}: #{inspect(changeset.errors)}")
        end
      end
    end)
  end

  defp migrate_examples(puzzle, solution, mongo_id) do
    examples = solution["examples"] || []

    examples
    |> Enum.with_index()
    |> Enum.each(fn {ex, idx} ->
      # Check if already exists by legacy_id
      legacy_id = "#{mongo_id}_ex_#{idx}"

      unless Repo.get_by(PuzzleExample, legacy_id: legacy_id) do
        attrs = %{
          puzzle_id: puzzle.id,
          input: ex["input"] || "",
          output: ex["output"] || "",
          explanation: ex["explanation"],
          order: idx,
          legacy_id: legacy_id,
          metadata: %{}
        }

        case PuzzleExample.changeset(%PuzzleExample{}, attrs) |> Repo.insert() do
          {:ok, _} -> :ok
          {:error, changeset} ->
            Logger.warning("   Failed to migrate example #{idx} for puzzle #{puzzle.title}: #{inspect(changeset.errors)}")
        end
      end
    end)
  end

  defp migrate_submissions do
    Logger.info("\n📝 Migrating submissions...")

    case Mongo.find(:mongo_migration, "submissions", %{}) |> Enum.to_list() do
      [] ->
        Logger.warning("   No submissions found")
        %{collection: "submissions", migrated: 0, skipped: 0, failed: 0}

      mongo_submissions ->
        total = length(mongo_submissions)
        Logger.info("   Found #{total} submissions")

        {migrated, skipped, failed} = mongo_submissions
        |> Enum.chunk_every(@batch_size)
        |> Enum.with_index(1)
        |> Enum.reduce({0, 0, 0}, fn {batch, batch_num}, {m, s, f} ->
          Logger.info("   Processing batch #{batch_num}/#{ceil(total / @batch_size)}")

          Enum.reduce(batch, {m, s, f}, fn submission, {migrated, skipped, failed} ->
            case migrate_single_submission(submission) do
              {:ok, :created} -> {migrated + 1, skipped, failed}
              {:ok, :skipped} -> {migrated, skipped + 1, failed}
              {:error, _} -> {migrated, skipped, failed + 1}
            end
          end)
        end)

        Logger.info("   ✓ Submissions: #{migrated} migrated, #{skipped} skipped, #{failed} failed")
        %{collection: "submissions", migrated: migrated, skipped: skipped, failed: failed, total: total}
    end
  end

  defp migrate_single_submission(mongo_submission) do
    mongo_id = extract_mongo_id(mongo_submission["_id"])

    case Repo.get_by(Submission, legacy_id: mongo_id) do
      %Submission{} -> {:ok, :skipped}
      nil ->
        user_mongo_id = extract_mongo_id(mongo_submission["user"])
        puzzle_mongo_id = extract_mongo_id(mongo_submission["puzzle"])

        user = Repo.get_by(User, legacy_id: user_mongo_id)
        puzzle = Repo.get_by(Puzzle, legacy_id: puzzle_mongo_id)

        cond do
          is_nil(user) ->
            {:error, :user_not_found}
          is_nil(puzzle) ->
            {:error, :puzzle_not_found}
          true ->
            # Get or create programming language
            language_data = mongo_submission["programmingLanguage"]
            language_name = cond do
              is_struct(language_data, BSON.ObjectId) -> "unknown"
              is_map(language_data) -> language_data["language"]
              is_binary(language_data) -> language_data
              true -> "unknown"
            end

            programming_language = get_or_create_language(language_name || "unknown")

            result = mongo_submission["result"] || %{}
            # Clean BSON ObjectIds from result
            result = clean_bson_objectids(result)

            attrs = %{
              user_id: user.id,
              puzzle_id: puzzle.id,
              programming_language_id: programming_language && programming_language.id,
              code: mongo_submission["code"] || "",
              result: result,
              score: calculate_score(result),
              legacy_id: mongo_id
            }

            changeset = Submission.create_changeset(%Submission{}, attrs)

            # Set timestamps
            changeset = changeset
            |> Ecto.Changeset.put_change(:inserted_at, parse_datetime(mongo_submission["createdAt"]) || DateTime.utc_now())
            |> Ecto.Changeset.put_change(:updated_at, parse_datetime(mongo_submission["updatedAt"]) || DateTime.utc_now())

            case Repo.insert(changeset) do
              {:ok, _} -> {:ok, :created}
              {:error, changeset} ->
                Logger.debug("   Failed to migrate submission: #{inspect(changeset.errors)}")
                {:error, changeset}
            end
        end
    end
  end

  defp migrate_games do
    Logger.info("\n🎮 Migrating games...")

    case Mongo.find(:mongo_migration, "games", %{}) |> Enum.to_list() do
      [] ->
        Logger.warning("   No games found in MongoDB")
        %{collection: "games", migrated: 0, skipped: 0, failed: 0}

      mongo_games ->
        total = length(mongo_games)
        Logger.info("   Found #{total} games")

        {migrated, skipped, failed} = mongo_games
        |> Enum.chunk_every(@batch_size)
        |> Enum.with_index(1)
        |> Enum.reduce({0, 0, 0}, fn {batch, batch_num}, {m, s, f} ->
          Logger.info("   Processing batch #{batch_num}/#{ceil(total / @batch_size)}")

          batch_results = Enum.map(batch, &migrate_single_game/1)

          migrated_count = Enum.count(batch_results, &match?({:ok, :created}, &1))
          skipped_count = Enum.count(batch_results, &match?({:ok, :skipped}, &1))
          failed_count = Enum.count(batch_results, &match?({:error, _}, &1))

          {m + migrated_count, s + skipped_count, f + failed_count}
        end)

        Logger.info("   ✓ Games: #{migrated} migrated, #{skipped} skipped, #{failed} failed")
        %{collection: "games", migrated: migrated, skipped: skipped, failed: failed, total: total}
    end
  end

  defp migrate_single_game(mongo_game) do
    mongo_id = mongo_game["_id"] |> BSON.ObjectId.encode!() |> Base.encode16(case: :lower)

    # Check if already migrated
    case Repo.get_by(Game, legacy_id: mongo_id) do
      %Game{} -> {:ok, :skipped}
      nil ->
        # Get owner
        owner = case mongo_game["owner"] do
          %BSON.ObjectId{} = oid ->
            owner_id = oid |> BSON.ObjectId.encode!() |> Base.encode16(case: :lower)
            Repo.get_by(User, legacy_id: owner_id)
          _ -> nil
        end

        # Get puzzle
        puzzle = case mongo_game["puzzle"] do
          %BSON.ObjectId{} = oid ->
            puzzle_id = oid |> BSON.ObjectId.encode!() |> Base.encode16(case: :lower)
            Repo.get_by(Puzzle, legacy_id: puzzle_id)
          _ -> nil
        end

        cond do
          is_nil(owner) ->
            {:error, :owner_not_found}
          is_nil(puzzle) ->
            {:error, :puzzle_not_found}
          true ->
            # Clean BSON ObjectIds from options
            options = mongo_game["options"] || %{}
            options = clean_bson_objectids(options)

            # Parse timestamps
            started_at = parse_datetime(mongo_game["startedAt"])
            ended_at = parse_datetime(mongo_game["endedAt"])
            created_at = parse_datetime(mongo_game["createdAt"]) || DateTime.utc_now()
            updated_at = parse_datetime(mongo_game["updatedAt"]) || DateTime.utc_now()

            attrs = %{
              owner_id: owner.id,
              puzzle_id: puzzle.id,
              visibility: parse_game_visibility(mongo_game["visibility"]),
              mode: parse_game_mode(mongo_game["mode"]),
              rated: mongo_game["ranked"] || true,
              status: parse_game_status(mongo_game["status"]),
              max_duration_seconds: mongo_game["maxDuration"] || 600,
              allowed_language_ids: [],
              options: options,
              started_at: started_at,
              ended_at: ended_at,
              legacy_id: mongo_id
            }

            changeset = Game.changeset(%Game{}, attrs)

            # Set timestamps
            changeset = changeset
            |> Ecto.Changeset.put_change(:inserted_at, created_at)
            |> Ecto.Changeset.put_change(:updated_at, updated_at)

            case Repo.insert(changeset) do
              {:ok, _} -> {:ok, :created}
              {:error, changeset} ->
                Logger.debug("   Failed to migrate game: #{inspect(changeset.errors)}")
                {:error, changeset}
            end
        end
    end
  end

  defp migrate_comments do
    Logger.info("\n💬 Migrating comments...")

    case Mongo.find(:mongo_migration, "comments", %{}) |> Enum.to_list() do
      [] ->
        Logger.warning("   No comments found in MongoDB")
        %{collection: "comments", migrated: 0, skipped: 0, failed: 0}

      mongo_comments ->
        total = length(mongo_comments)
        Logger.info("   Found #{total} comments")

        {migrated, skipped, failed} = mongo_comments
        |> Enum.chunk_every(@batch_size)
        |> Enum.with_index(1)
        |> Enum.reduce({0, 0, 0}, fn {batch, batch_num}, {m, s, f} ->
          Logger.info("   Processing batch #{batch_num}/#{ceil(total / @batch_size)}")

          batch_results = Enum.map(batch, &migrate_single_comment/1)

          migrated_count = Enum.count(batch_results, &match?({:ok, :created}, &1))
          skipped_count = Enum.count(batch_results, &match?({:ok, :skipped}, &1))
          failed_count = Enum.count(batch_results, &match?({:error, _}, &1))

          {m + migrated_count, s + skipped_count, f + failed_count}
        end)

        Logger.info("   ✓ Comments: #{migrated} migrated, #{skipped} skipped, #{failed} failed")
        %{collection: "comments", migrated: migrated, skipped: skipped, failed: failed, total: total}
    end
  end

  defp migrate_single_comment(mongo_comment) do
    mongo_id = mongo_comment["_id"] |> BSON.ObjectId.encode!() |> Base.encode16(case: :lower)

    # Check if already migrated
    case Repo.get_by(Comment, legacy_id: mongo_id) do
      %Comment{} -> {:ok, :skipped}
      nil ->
        # Get author
        author = case mongo_comment["author"] do
          %BSON.ObjectId{} = oid ->
            author_id = oid |> BSON.ObjectId.encode!() |> Base.encode16(case: :lower)
            Repo.get_by(User, legacy_id: author_id)
          _ -> nil
        end

        # Get puzzle (optional)
        puzzle = case mongo_comment["puzzle"] do
          %BSON.ObjectId{} = oid ->
            puzzle_id = oid |> BSON.ObjectId.encode!() |> Base.encode16(case: :lower)
            Repo.get_by(Puzzle, legacy_id: puzzle_id)
          _ -> nil
        end

        # Get parent comment (optional)
        parent_comment = case mongo_comment["parent"] do
          %BSON.ObjectId{} = oid ->
            parent_id = oid |> BSON.ObjectId.encode!() |> Base.encode16(case: :lower)
            Repo.get_by(Comment, legacy_id: parent_id)
          _ -> nil
        end

        if is_nil(author) do
          {:error, :author_not_found}
        else
          # Parse timestamps
          created_at = parse_datetime(mongo_comment["createdAt"]) || DateTime.utc_now()
          updated_at = parse_datetime(mongo_comment["updatedAt"]) || DateTime.utc_now()

          # Get votes
          votes = mongo_comment["votes"] || %{}
          upvotes = if is_list(votes["up"]), do: length(votes["up"]), else: 0
          downvotes = if is_list(votes["down"]), do: length(votes["down"]), else: 0

          attrs = %{
            author_id: author.id,
            puzzle_id: puzzle && puzzle.id,
            parent_comment_id: parent_comment && parent_comment.id,
            body: mongo_comment["text"] || "",
            comment_type: parse_comment_type(mongo_comment["commentType"], parent_comment),
            upvote_count: upvotes,
            downvote_count: downvotes,
            metadata: %{},
            legacy_id: mongo_id
          }

          changeset = Comment.changeset(%Comment{}, attrs)

          # Set timestamps
          changeset = changeset
          |> Ecto.Changeset.put_change(:inserted_at, created_at)
          |> Ecto.Changeset.put_change(:updated_at, updated_at)

          case Repo.insert(changeset) do
            {:ok, _} -> {:ok, :created}
            {:error, changeset} ->
              Logger.debug("   Failed to migrate comment: #{inspect(changeset.errors)}")
              {:error, changeset}
          end
        end
    end
  end

  defp migrate_reports do
    Logger.info("\n🚨 Migrating reports...")

    case Mongo.find(:mongo_migration, "reports", %{}) |> Enum.to_list() do
      [] ->
        Logger.warning("   No reports found in MongoDB")
        %{collection: "reports", migrated: 0, skipped: 0, failed: 0}

      mongo_reports ->
        total = length(mongo_reports)
        Logger.info("   Found #{total} reports")

        {migrated, skipped, failed} = mongo_reports
        |> Enum.chunk_every(@batch_size)
        |> Enum.with_index(1)
        |> Enum.reduce({0, 0, 0}, fn {batch, batch_num}, {m, s, f} ->
          Logger.info("   Processing batch #{batch_num}/#{ceil(total / @batch_size)}")

          batch_results = Enum.map(batch, &migrate_single_report/1)

          migrated_count = Enum.count(batch_results, &match?({:ok, :created}, &1))
          skipped_count = Enum.count(batch_results, &match?({:ok, :skipped}, &1))
          failed_count = Enum.count(batch_results, &match?({:error, _}, &1))

          {m + migrated_count, s + skipped_count, f + failed_count}
        end)

        Logger.info("   ✓ Reports: #{migrated} migrated, #{skipped} skipped, #{failed} failed")
        %{collection: "reports", migrated: migrated, skipped: skipped, failed: failed, total: total}
    end
  end

  defp migrate_single_report(mongo_report) do
    mongo_id = mongo_report["_id"] |> BSON.ObjectId.encode!() |> Base.encode16(case: :lower)

    # Check if already migrated
    case Repo.get_by(Report, legacy_id: mongo_id) do
      %Report{} -> {:ok, :skipped}
      nil ->
        # Get reporter
        reporter = case mongo_report["reportedBy"] do
          %BSON.ObjectId{} = oid ->
            reporter_id = oid |> BSON.ObjectId.encode!() |> Base.encode16(case: :lower)
            Repo.get_by(User, legacy_id: reporter_id)
          _ -> nil
        end

        if is_nil(reporter) do
          {:error, :reporter_not_found}
        else
          # Get problem reference ID and try to find the PostgreSQL UUID
          problem_ref_id = case {mongo_report["problematicCollection"], mongo_report["problematicIdentifier"]} do
            {collection, %BSON.ObjectId{} = oid} when not is_nil(collection) ->
              legacy_id = oid |> BSON.ObjectId.encode!() |> Base.encode16(case: :lower)

              # Try to find the migrated entity's PostgreSQL UUID
              case String.downcase(collection || "") do
                "users" ->
                  case Repo.get_by(User, legacy_id: legacy_id) do
                    %User{id: id} -> id
                    _ -> nil
                  end
                "puzzles" ->
                  case Repo.get_by(Puzzle, legacy_id: legacy_id) do
                    %Puzzle{id: id} -> id
                    _ -> nil
                  end
                "comments" ->
                  case Repo.get_by(Comment, legacy_id: legacy_id) do
                    %Comment{id: id} -> id
                    _ -> nil
                  end
                "games" ->
                  case Repo.get_by(Game, legacy_id: legacy_id) do
                    %Game{id: id} -> id
                    _ -> nil
                  end
                _ -> nil
              end
            _ -> nil
          end

          # If problem_ref_id is still nil, generate a placeholder UUID (referenced entity doesn't exist in PostgreSQL)
          # The snapshot field contains the original data anyway
          problem_ref_id = problem_ref_id || Ecto.UUID.generate()

          # Parse timestamps
          created_at = parse_datetime(mongo_report["createdAt"]) || DateTime.utc_now()
          updated_at = parse_datetime(mongo_report["updatedAt"]) || DateTime.utc_now()
          resolved_at = parse_datetime(mongo_report["resolvedAt"])

          # Get explanation (min 10 chars required)
          explanation = case mongo_report["reason"] do
            nil -> "No explanation provided (migrated from legacy data)"
            "" -> "No explanation provided (migrated from legacy data)"
            reason when is_binary(reason) and byte_size(reason) < 10 ->
              "#{reason} (migrated from legacy data)"
            reason -> reason
          end

          attrs = %{
            reported_by_id: reporter.id,
            problem_type: parse_problem_type(mongo_report["problematicCollection"]),
            problem_reference_id: problem_ref_id,
            problem_reference_snapshot: clean_bson_objectids(mongo_report["snapshot"] || %{}),
            explanation: explanation,
            status: parse_report_status(mongo_report["status"]),
            resolution_notes: mongo_report["resolutionNotes"],
            resolved_at: resolved_at,
            metadata: %{},
            legacy_id: mongo_id
          }

          # For migration, we bypass the strict validation and build changeset manually
          # since many reports may not have valid problem_reference_ids in PostgreSQL
          changeset = %Report{}
          |> Ecto.Changeset.cast(attrs, [
            :legacy_id,
            :problem_type,
            :problem_reference_id,
            :problem_reference_snapshot,
            :explanation,
            :status,
            :metadata,
            :reported_by_id,
            :resolution_notes,
            :resolved_at
          ])
          |> Ecto.Changeset.validate_required([:problem_type, :explanation, :reported_by_id])
          |> Ecto.Changeset.validate_length(:explanation, min: 10, max: 2_000)
          |> Ecto.Changeset.validate_inclusion(:problem_type, ["puzzle", "user", "comment", "game_chat"])
          |> Ecto.Changeset.validate_inclusion(:status, ["pending", "resolved", "rejected"])

          # Set timestamps
          changeset = changeset
          |> Ecto.Changeset.put_change(:inserted_at, created_at)
          |> Ecto.Changeset.put_change(:updated_at, updated_at)

          case Repo.insert(changeset) do
            {:ok, _} -> {:ok, :created}
            {:error, changeset} ->
              Logger.debug("   Failed to migrate report: #{inspect(changeset.errors)}")
              {:error, changeset}
          end
        end
    end
  end

  defp migrate_preferences do
    Logger.info("\n⚙️  Migrating preferences...")

    case Mongo.find(:mongo_migration, "preferences", %{}) |> Enum.to_list() do
      [] ->
        Logger.warning("   No preferences found in MongoDB")
        %{collection: "preferences", migrated: 0, skipped: 0, failed: 0}

      mongo_preferences ->
        total = length(mongo_preferences)
        Logger.info("   Found #{total} preferences")

        {migrated, skipped, failed} = mongo_preferences
        |> Enum.chunk_every(@batch_size)
        |> Enum.with_index(1)
        |> Enum.reduce({0, 0, 0}, fn {batch, batch_num}, {m, s, f} ->
          Logger.info("   Processing batch #{batch_num}/#{ceil(total / @batch_size)}")

          batch_results = Enum.map(batch, &migrate_single_preference/1)

          migrated_count = Enum.count(batch_results, &match?({:ok, :created}, &1))
          skipped_count = Enum.count(batch_results, &match?({:ok, :skipped}, &1))
          failed_count = Enum.count(batch_results, &match?({:error, _}, &1))

          {m + migrated_count, s + skipped_count, f + failed_count}
        end)

        Logger.info("   ✓ Preferences: #{migrated} migrated, #{skipped} skipped, #{failed} failed")
        %{collection: "preferences", migrated: migrated, skipped: skipped, failed: failed, total: total}
    end
  end

  defp migrate_single_preference(mongo_preference) do
    mongo_id = mongo_preference["_id"] |> BSON.ObjectId.encode!() |> Base.encode16(case: :lower)

    # Check if already migrated
    case Repo.get_by(Preference, legacy_id: mongo_id) do
      %Preference{} -> {:ok, :skipped}
      nil ->
        # Get user - try "owner", "userId", and "user" fields
        user = case mongo_preference["owner"] || mongo_preference["userId"] || mongo_preference["user"] do
          %BSON.ObjectId{} = oid ->
            user_id = oid |> BSON.ObjectId.encode!() |> Base.encode16(case: :lower)
            Repo.get_by(User, legacy_id: user_id)
          user_id when is_binary(user_id) ->
            # Already a string ID
            Repo.get_by(User, legacy_id: user_id)
          _ -> nil
        end

        if is_nil(user) do
          Logger.debug("   User not found for preference: #{mongo_id}, user field: #{inspect(mongo_preference["owner"] || mongo_preference["userId"] || mongo_preference["user"])}")
          {:error, :user_not_found}
        else
          # Parse timestamps
          created_at = parse_datetime(mongo_preference["createdAt"]) || DateTime.utc_now()
          updated_at = parse_datetime(mongo_preference["updatedAt"]) || DateTime.utc_now()

          # Clean editor config
          editor = clean_bson_objectids(mongo_preference["editor"] || %{})

          attrs = %{
            user_id: user.id,
            preferred_language: mongo_preference["preferredLanguage"],
            theme: parse_theme(mongo_preference["theme"]),
            blocked_user_ids: [],
            editor: editor,
            legacy_id: mongo_id
          }

          changeset = Preference.changeset(%Preference{}, attrs)

          # Set timestamps
          changeset = changeset
          |> Ecto.Changeset.put_change(:inserted_at, created_at)
          |> Ecto.Changeset.put_change(:updated_at, updated_at)

          case Repo.insert(changeset) do
            {:ok, _} -> {:ok, :created}
            {:error, changeset} ->
              Logger.debug("   Failed to migrate preference: #{inspect(changeset.errors)}")
              {:error, changeset}
          end
        end
    end
  end

  defp validate_migration do
    Logger.info("\n🔍 Validating migration...")

    validations = [
      {"users", count_mongo("users"), Repo.aggregate(User, :count)},
      {"puzzles", count_mongo("puzzles"), Repo.aggregate(Puzzle, :count)},
      {"submissions", count_mongo("submissions"), Repo.aggregate(Submission, :count)},
      {"games", count_mongo("games"), Repo.aggregate(Game, :count)},
      {"comments", count_mongo("comments"), Repo.aggregate(Comment, :count)},
      {"reports", count_mongo("reports"), Repo.aggregate(Report, :count)},
      {"preferences", count_mongo("preferences"), Repo.aggregate(Preference, :count)}
    ]

    Enum.each(validations, fn {name, mongo_count, pg_count} ->
      status = if mongo_count == pg_count, do: "✅", else: "❌"
      Logger.info("   #{status} #{String.pad_trailing(name, 15)} MongoDB: #{mongo_count}, PostgreSQL: #{pg_count}")
    end)

    Logger.info("\n✅ Validation complete")
  end

  defp dry_run(only) do
    Logger.info("\n🔍 DRY RUN - No data will be migrated\n")

    collections = case only do
      nil -> ["users", "puzzles", "submissions", "games", "comments", "reports", "preferences"]
      collection -> [collection]
    end

    Enum.each(collections, fn collection ->
      mongo_count = count_mongo(collection)
      pg_count = case collection do
        "users" -> Repo.aggregate(User, :count)
        "puzzles" -> Repo.aggregate(Puzzle, :count)
        "submissions" -> Repo.aggregate(Submission, :count)
        _ -> 0
      end

      to_migrate = mongo_count - pg_count
      Logger.info("   #{collection}: #{mongo_count} in MongoDB, #{pg_count} in PostgreSQL → would migrate #{max(0, to_migrate)}")
    end)
  end

  defp print_summary(results) do
    Logger.info("\n📊 Migration Summary:")
    Logger.info("   " <> String.duplicate("=", 60))

    Enum.each(results, fn result ->
      collection = String.pad_trailing(result.collection, 15)

      if Map.has_key?(result, :note) do
        Logger.info("   #{collection} - #{result.note}")
      else
        migrated = String.pad_leading("#{result.migrated}", 4)
        skipped = String.pad_leading("#{result.skipped}", 4)
        failed = String.pad_leading("#{result.failed}", 4)
        total = Map.get(result, :total, result.migrated + result.skipped + result.failed)

        Logger.info("   #{collection} - #{migrated} migrated, #{skipped} skipped, #{failed} failed (#{total} total)")
      end
    end)

    Logger.info("   " <> String.duplicate("=", 60))
  end

  # Helper functions

  defp extract_mongo_id(%BSON.ObjectId{} = oid), do: BSON.ObjectId.encode!(oid) |> Base.encode16(case: :lower)
  defp extract_mongo_id(id) when is_binary(id), do: id
  defp extract_mongo_id(_), do: nil

  defp parse_datetime(%DateTime{} = dt) do
    # Ensure microsecond precision for :utc_datetime_usec
    %{dt | microsecond: {elem(dt.microsecond, 0), 6}}
  end
  defp parse_datetime(nil), do: nil
  defp parse_datetime(_), do: DateTime.utc_now()

  defp parse_role("admin"), do: "admin"
  defp parse_role("moderator"), do: "moderator"
  defp parse_role(_), do: "user"

  defp parse_difficulty("BEGINNER"), do: "BEGINNER"
  defp parse_difficulty("EASY"), do: "EASY"
  defp parse_difficulty("MEDIUM"), do: "INTERMEDIATE"
  defp parse_difficulty("INTERMEDIATE"), do: "INTERMEDIATE"
  defp parse_difficulty("HARD"), do: "HARD"
  defp parse_difficulty("EXPERT"), do: "EXPERT"
  defp parse_difficulty(_), do: "INTERMEDIATE"

  defp parse_visibility("APPROVED"), do: "APPROVED"
  defp parse_visibility("REVIEW"), do: "REVIEW"
  defp parse_visibility("DRAFT"), do: "DRAFT"
  defp parse_visibility("REVISE"), do: "REVISE"
  defp parse_visibility("INACTIVE"), do: "INACTIVE"
  defp parse_visibility(_), do: "DRAFT"

  defp parse_submission_status("success"), do: :accepted
  defp parse_submission_status("error"), do: :wrong_answer
  defp parse_submission_status(_), do: :pending

  defp calculate_score(%{"result" => "success"}), do: 100.0
  defp calculate_score(%{"result" => "error"}), do: 0.0
  defp calculate_score(_), do: nil

  defp parse_game_visibility("public"), do: "public"
  defp parse_game_visibility("private"), do: "private"
  defp parse_game_visibility("friends"), do: "friends"
  defp parse_game_visibility(_), do: "public"

  defp parse_game_mode("FASTEST"), do: "FASTEST"
  defp parse_game_mode("SHORTEST"), do: "SHORTEST"
  defp parse_game_mode("BACKWARDS"), do: "BACKWARDS"
  defp parse_game_mode("HARDCORE"), do: "HARDCORE"
  defp parse_game_mode("DEBUG"), do: "DEBUG"
  defp parse_game_mode("TYPERACER"), do: "TYPERACER"
  defp parse_game_mode("EFFICIENCY"), do: "EFFICIENCY"
  defp parse_game_mode("INCREMENTAL"), do: "INCREMENTAL"
  defp parse_game_mode("RANDOM"), do: "RANDOM"
  defp parse_game_mode(_), do: "FASTEST"

  defp parse_game_status("waiting"), do: "waiting"
  defp parse_game_status("in_progress"), do: "in_progress"
  defp parse_game_status("completed"), do: "completed"
  defp parse_game_status("cancelled"), do: "cancelled"
  defp parse_game_status(_), do: "waiting"

  defp parse_comment_type(nil, nil), do: "puzzle-comment"
  defp parse_comment_type(nil, _parent), do: "comment-comment"
  defp parse_comment_type("puzzle-comment", _), do: "puzzle-comment"
  defp parse_comment_type("comment-comment", _), do: "comment-comment"
  defp parse_comment_type(_, nil), do: "puzzle-comment"
  defp parse_comment_type(_, _parent), do: "comment-comment"

  defp parse_problem_type("puzzles"), do: "puzzle"
  defp parse_problem_type("users"), do: "user"
  defp parse_problem_type("comments"), do: "comment"
  defp parse_problem_type("game_chat"), do: "game_chat"
  defp parse_problem_type(_), do: "puzzle"

  defp parse_report_status("pending"), do: "pending"
  defp parse_report_status("resolved"), do: "resolved"
  defp parse_report_status("rejected"), do: "rejected"
  defp parse_report_status(_), do: "pending"

  defp parse_theme("dark"), do: "dark"
  defp parse_theme("light"), do: "light"
  defp parse_theme(_), do: nil

  defp get_or_create_language(language_name) do
    alias CodincodApi.Languages.ProgrammingLanguage

    case Repo.get_by(ProgrammingLanguage, language: language_name) do
      %ProgrammingLanguage{} = lang ->
        lang

      nil ->
        # Create it if it doesn't exist
        attrs = %{
          language: language_name,
          version: "unknown",
          runtime: "unknown"
        }

        case Repo.insert(ProgrammingLanguage.changeset(%ProgrammingLanguage{}, attrs)) do
          {:ok, lang} -> lang
          {:error, _} -> nil
        end
    end
  rescue
    _ -> nil
  end

  defp generate_slug(title) do
    title
    |> String.downcase()
    |> String.replace(~r/[^a-z0-9\s-]/, "")
    |> String.replace(~r/\s+/, "-")
    |> String.slice(0, 100)
  end

  defp count_mongo(collection) do
    case Mongo.count_documents(:mongo_migration, collection, %{}) do
      {:ok, count} -> count
      _ -> 0
    end
  rescue
    _ -> 0
  end

  defp clean_bson_objectids(%BSON.ObjectId{} = oid) do
    BSON.ObjectId.encode!(oid) |> Base.encode16(case: :lower)
  end

  defp clean_bson_objectids(data) when is_map(data) do
    data
    |> Enum.map(fn {k, v} -> {k, clean_bson_objectids(v)} end)
    |> Enum.into(%{})
  end

  defp clean_bson_objectids(data) when is_list(data) do
    Enum.map(data, &clean_bson_objectids/1)
  end

  defp clean_bson_objectids(data), do: data
end
