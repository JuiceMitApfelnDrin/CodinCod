#!/usr/bin/env elixir

# Script to verify MongoDB to PostgreSQL migration accuracy
# Compares test objects in MongoDB with their migrated counterparts in PostgreSQL
#
# Usage:
#   MONGO_URI="..." MONGO_DB_NAME="..." mix run priv/repo/scripts/verify_migration.exs

require Logger
import Ecto.Query

alias CodincodApi.Repo
alias CodincodApi.Accounts.{User, Preference}
alias CodincodApi.Puzzles.{Puzzle, PuzzleTestCase, PuzzleExample}
alias CodincodApi.Submissions.Submission
alias CodincodApi.Games.Game
alias CodincodApi.Comments.Comment
alias CodincodApi.Moderation.Report

defmodule MigrationVerifier do
  require Logger

  def generate_test_object_id(prefix) do
    # Generate same deterministic ObjectIds as seed script
    hash = :crypto.hash(:md5, prefix) |> binary_part(0, 12)
    %BSON.ObjectId{value: hash}
  end

  def extract_mongo_id(%BSON.ObjectId{value: value}), do: Base.encode16(value, case: :lower)
  def extract_mongo_id(value) when is_binary(value) and byte_size(value) == 12 do
    Base.encode16(value, case: :lower)
  end
  def extract_mongo_id(value) when is_binary(value), do: value
  def extract_mongo_id(_), do: nil

  def verify_user(mongo_user, pg_user) do
    errors = []

    errors = if mongo_user["username"] != pg_user.username do
      ["Username mismatch: #{mongo_user["username"]} != #{pg_user.username}" | errors]
    else
      errors
    end

    errors = if mongo_user["email"] != pg_user.email do
      ["Email mismatch: #{mongo_user["email"]} != #{pg_user.email}" | errors]
    else
      errors
    end

    errors = if mongo_user["role"] != pg_user.role do
      ["Role mismatch: #{mongo_user["role"]} != #{pg_user.role}" | errors]
    else
      errors
    end

    if errors == [] do
      {:ok, "✅ User '#{pg_user.username}' verified"}
    else
      {:error, "❌ User '#{pg_user.username}' has mismatches", errors}
    end
  end

  def verify_puzzle(mongo_puzzle, pg_puzzle, conn) do
    errors = []

    errors = if mongo_puzzle["title"] != pg_puzzle.title do
      ["Title mismatch: #{mongo_puzzle["title"]} != #{pg_puzzle.title}" | errors]
    else
      errors
    end

    errors = if mongo_puzzle["statement"] != pg_puzzle.statement do
      ["Statement mismatch" | errors]
    else
      errors
    end

    errors = if mongo_puzzle["constraints"] != pg_puzzle.constraints do
      ["Constraints mismatch" | errors]
    else
      errors
    end

    # Verify difficulty
    mongo_difficulty = String.downcase(mongo_puzzle["difficulty"] || "")
    pg_difficulty = String.downcase(pg_puzzle.difficulty || "")
    errors = if mongo_difficulty != pg_difficulty do
      ["Difficulty mismatch: #{mongo_difficulty} != #{pg_difficulty}" | errors]
    else
      errors
    end

    # Verify tags
    mongo_tags = Enum.sort(mongo_puzzle["tags"] || [])
    pg_tags = Enum.sort(pg_puzzle.tags || [])
    errors = if mongo_tags != pg_tags do
      ["Tags mismatch: #{inspect(mongo_tags)} != #{inspect(pg_tags)}" | errors]
    else
      errors
    end

    # Verify test cases (validators in MongoDB)
    mongo_validators = mongo_puzzle["validators"] || []
    pg_test_cases = Repo.all(
      from tc in PuzzleTestCase,
        where: tc.puzzle_id == ^pg_puzzle.id,
        order_by: [asc: tc.order]
    )

    if length(mongo_validators) != length(pg_test_cases) do
      errors = ["Test case count mismatch: #{length(mongo_validators)} != #{length(pg_test_cases)}" | errors]
    else
      # Verify each test case
      validator_errors = Enum.zip(mongo_validators, pg_test_cases)
      |> Enum.with_index()
      |> Enum.flat_map(fn {{mv, tc}, idx} ->
        tc_errors = []
        tc_errors = if mv["input"] != tc.input do
          ["TC#{idx} input mismatch" | tc_errors]
        else
          tc_errors
        end

        tc_errors = if mv["output"] != tc.expected_output do
          ["TC#{idx} output mismatch: #{mv["output"]} != #{tc.expected_output}" | tc_errors]
        else
          tc_errors
        end

        tc_errors
      end)

      errors = errors ++ validator_errors
    end

    # Verify examples if present
    mongo_examples = get_in(mongo_puzzle, ["solution", "examples"]) || []
    pg_examples = Repo.all(
      from ex in PuzzleExample,
        where: ex.puzzle_id == ^pg_puzzle.id,
        order_by: [asc: ex.order]
    )

    if length(mongo_examples) > 0 and length(mongo_examples) != length(pg_examples) do
      errors = ["Example count mismatch: #{length(mongo_examples)} != #{length(pg_examples)}" | errors]
    end

    if errors == [] do
      {:ok, "✅ Puzzle '#{pg_puzzle.title}' verified (#{length(pg_test_cases)} test cases, #{length(pg_examples)} examples)"}
    else
      {:error, "❌ Puzzle '#{pg_puzzle.title}' has mismatches", errors}
    end
  end

  def verify_submission(mongo_sub, pg_sub) do
    errors = []

    errors = if mongo_sub["code"] != pg_sub.code do
      ["Code mismatch" | errors]
    else
      errors
    end

    # Verify status
    mongo_status = String.downcase(mongo_sub["status"] || "pending")
    pg_status = String.downcase(Atom.to_string(pg_sub.status))

    # Map MongoDB statuses to PostgreSQL
    status_map = %{
      "accepted" => "accepted",
      "wrong_answer" => "wrong_answer",
      "runtime_error" => "runtime_error",
      "time_limit_exceeded" => "time_limit_exceeded",
      "pending" => "pending"
    }

    expected_status = Map.get(status_map, mongo_status, mongo_status)
    errors = if expected_status != pg_status do
      ["Status mismatch: #{mongo_status} != #{pg_status}" | errors]
    else
      errors
    end

    if errors == [] do
      {:ok, "✅ Submission verified (status: #{pg_status})"}
    else
      {:error, "❌ Submission has mismatches", errors}
    end
  end

  def verify_game(mongo_game, pg_game) do
    errors = []

    # Verify player count
    mongo_player_count = length(mongo_game["players"] || [])
    pg_player_count = length(pg_game.player_ids || [])

    errors = if mongo_player_count != pg_player_count do
      ["Player count mismatch: #{mongo_player_count} != #{pg_player_count}" | errors]
    else
      errors
    end

    # Verify game mode
    mongo_mode = String.downcase(mongo_game["gameMode"] || "")
    pg_mode = String.downcase(Atom.to_string(pg_game.game_mode))

    errors = if mongo_mode != pg_mode do
      ["Game mode mismatch: #{mongo_mode} != #{pg_mode}" | errors]
    else
      errors
    end

    # Verify options are preserved
    mongo_options = mongo_game["options"] || %{}
    pg_options = pg_game.options || %{}

    errors = if is_map(mongo_options) and map_size(mongo_options) > 0 and map_size(pg_options) == 0 do
      ["Options not migrated" | errors]
    else
      errors
    end

    if errors == [] do
      {:ok, "✅ Game verified (#{pg_player_count} players, mode: #{pg_mode})"}
    else
      {:error, "❌ Game has mismatches", errors}
    end
  end

  def verify_comment(mongo_comment, pg_comment) do
    errors = []

    errors = if mongo_comment["text"] != pg_comment.text do
      ["Text mismatch" | errors]
    else
      errors
    end

    # Verify comment type
    mongo_type = String.downcase(mongo_comment["commentType"] || "discussion")
    pg_type = String.downcase(Atom.to_string(pg_comment.comment_type))

    errors = if mongo_type != pg_type do
      ["Type mismatch: #{mongo_type} != #{pg_type}" | errors]
    else
      errors
    end

    if errors == [] do
      {:ok, "✅ Comment verified (type: #{pg_type})"}
    else
      {:error, "❌ Comment has mismatches", errors}
    end
  end

  def verify_report(mongo_report, pg_report) do
    errors = []

    errors = if mongo_report["description"] != pg_report.description do
      ["Description mismatch" | errors]
    else
      errors
    end

    # Verify reason
    mongo_reason = String.downcase(mongo_report["reason"] || "")
    pg_reason = String.downcase(Atom.to_string(pg_report.reason))

    errors = if mongo_reason != pg_reason do
      ["Reason mismatch: #{mongo_reason} != #{pg_reason}" | errors]
    else
      errors
    end

    # Verify snapshot is preserved
    mongo_snapshot = mongo_report["problemReferenceSnapshot"]
    pg_snapshot = pg_report.problem_reference_snapshot

    errors = if is_map(mongo_snapshot) and is_nil(pg_snapshot) do
      ["Snapshot not migrated" | errors]
    else
      errors
    end

    if errors == [] do
      {:ok, "✅ Report verified (reason: #{pg_reason})"}
    else
      {:error, "❌ Report has mismatches", errors}
    end
  end

  def verify_preference(mongo_pref, pg_pref) do
    errors = []

    # Verify editor preferences are preserved
    mongo_editor = mongo_pref["editor"] || %{}
    pg_editor = pg_pref.editor || %{}

    errors = if is_map(mongo_editor) and map_size(mongo_editor) > 0 and map_size(pg_editor) == 0 do
      ["Editor preferences not migrated" | errors]
    else
      errors
    end

    # Check specific editor settings if both exist
    if map_size(mongo_editor) > 0 and map_size(pg_editor) > 0 do
      if mongo_editor["theme"] != pg_editor["theme"] do
        errors = ["Theme mismatch: #{mongo_editor["theme"]} != #{pg_editor["theme"]}" | errors]
      end
    end

    if errors == [] do
      {:ok, "✅ Preference verified"}
    else
      {:error, "❌ Preference has mismatches", errors}
    end
  end
end

# Main verification logic
Logger.info("🔍 Starting Migration Verification")
Logger.info(String.duplicate("=", 60))

# Connect to MongoDB
mongo_uri = System.get_env("MONGO_URI") || raise "MONGO_URI environment variable required"
mongo_db = System.get_env("MONGO_DB_NAME") || "codincod-development"

is_atlas = String.starts_with?(mongo_uri, "mongodb+srv://")

connect_opts = [
  url: mongo_uri,
  name: :mongo_verify,
  database: mongo_db,
  pool_size: 1
]

connect_opts = if is_atlas do
  Keyword.merge(connect_opts, [ssl: true, ssl_opts: [verify: :verify_none]])
else
  connect_opts
end

{:ok, conn} = Mongo.start_link(connect_opts)

try do
  total_verified = 0
  total_errors = 0

  # 1. Verify Users
  Logger.info("\n👤 Verifying Users...")
  test_users = Mongo.find(conn, "users", %{"email" => %{"$regex" => "@migration-test.com"}}) |> Enum.to_list()

  user_results = Enum.map(test_users, fn mongo_user ->
    mongo_id = MigrationVerifier.extract_mongo_id(mongo_user["_id"])
    pg_user = Repo.get_by(User, legacy_id: mongo_id)

    if pg_user do
      MigrationVerifier.verify_user(mongo_user, pg_user)
    else
      {:error, "❌ User not found in PostgreSQL", ["Missing migration"]}
    end
  end)

  Enum.each(user_results, fn
    {:ok, msg} ->
      Logger.info("   #{msg}")
      total_verified = total_verified + 1
    {:error, msg, errors} ->
      Logger.error("   #{msg}")
      Enum.each(errors, &Logger.error("      - #{&1}"))
      total_errors = total_errors + 1
  end)

  # 2. Verify Puzzles
  Logger.info("\n🧩 Verifying Puzzles...")
  test_puzzles = Mongo.find(conn, "puzzles", %{"tags" => "test-migration"}) |> Enum.to_list()

  puzzle_results = Enum.map(test_puzzles, fn mongo_puzzle ->
    mongo_id = MigrationVerifier.extract_mongo_id(mongo_puzzle["_id"])
    pg_puzzle = Repo.get_by(Puzzle, legacy_id: mongo_id)

    if pg_puzzle do
      MigrationVerifier.verify_puzzle(mongo_puzzle, pg_puzzle, conn)
    else
      {:error, "❌ Puzzle not found in PostgreSQL", ["Missing migration"]}
    end
  end)

  Enum.each(puzzle_results, fn
    {:ok, msg} ->
      Logger.info("   #{msg}")
      total_verified = total_verified + 1
    {:error, msg, errors} ->
      Logger.error("   #{msg}")
      Enum.each(errors, &Logger.error("      - #{&1}"))
      total_errors = total_errors + 1
  end)

  # 3. Verify Submissions
  Logger.info("\n📝 Verifying Submissions...")
  test_submission_ids = Enum.map(1..10, fn i ->
    MigrationVerifier.generate_test_object_id("test_submission_#{i}")
  end)

  test_submissions = Mongo.find(conn, "submissions", %{"_id" => %{"$in" => test_submission_ids}}) |> Enum.to_list()

  submission_results = Enum.map(test_submissions, fn mongo_sub ->
    mongo_id = MigrationVerifier.extract_mongo_id(mongo_sub["_id"])
    pg_sub = Repo.get_by(Submission, legacy_id: mongo_id)

    if pg_sub do
      MigrationVerifier.verify_submission(mongo_sub, pg_sub)
    else
      {:error, "❌ Submission not found in PostgreSQL", ["Missing migration"]}
    end
  end)

  Enum.each(submission_results, fn
    {:ok, msg} ->
      Logger.info("   #{msg}")
      total_verified = total_verified + 1
    {:error, msg, errors} ->
      Logger.error("   #{msg}")
      Enum.each(errors, &Logger.error("      - #{&1}"))
      total_errors = total_errors + 1
  end)

  # 4. Verify Games
  Logger.info("\n🎮 Verifying Games...")
  test_game_ids = Enum.map(1..4, fn i ->
    MigrationVerifier.generate_test_object_id("test_game_#{i}")
  end)

  test_games = Mongo.find(conn, "games", %{"_id" => %{"$in" => test_game_ids}}) |> Enum.to_list()

  game_results = Enum.map(test_games, fn mongo_game ->
    mongo_id = MigrationVerifier.extract_mongo_id(mongo_game["_id"])
    pg_game = Repo.get_by(Game, legacy_id: mongo_id)

    if pg_game do
      MigrationVerifier.verify_game(mongo_game, pg_game)
    else
      {:error, "❌ Game not found in PostgreSQL", ["Missing migration"]}
    end
  end)

  Enum.each(game_results, fn
    {:ok, msg} ->
      Logger.info("   #{msg}")
      total_verified = total_verified + 1
    {:error, msg, errors} ->
      Logger.error("   #{msg}")
      Enum.each(errors, &Logger.error("      - #{&1}"))
      total_errors = total_errors + 1
  end)

  # 5. Verify Comments
  Logger.info("\n💬 Verifying Comments...")
  test_comment_ids = Enum.map(1..6, fn i ->
    MigrationVerifier.generate_test_object_id("test_comment_#{i}")
  end)

  test_comments = Mongo.find(conn, "comments", %{"_id" => %{"$in" => test_comment_ids}}) |> Enum.to_list()

  comment_results = Enum.map(test_comments, fn mongo_comment ->
    mongo_id = MigrationVerifier.extract_mongo_id(mongo_comment["_id"])
    pg_comment = Repo.get_by(Comment, legacy_id: mongo_id)

    if pg_comment do
      MigrationVerifier.verify_comment(mongo_comment, pg_comment)
    else
      {:error, "❌ Comment not found in PostgreSQL", ["Missing migration"]}
    end
  end)

  Enum.each(comment_results, fn
    {:ok, msg} ->
      Logger.info("   #{msg}")
      total_verified = total_verified + 1
    {:error, msg, errors} ->
      Logger.error("   #{msg}")
      Enum.each(errors, &Logger.error("      - #{&1}"))
      total_errors = total_errors + 1
  end)

  # 6. Verify Reports
  Logger.info("\n🚩 Verifying Reports...")
  test_report_ids = Enum.map(1..3, fn i ->
    MigrationVerifier.generate_test_object_id("test_report_#{i}")
  end)

  test_reports = Mongo.find(conn, "reports", %{"_id" => %{"$in" => test_report_ids}}) |> Enum.to_list()

  report_results = Enum.map(test_reports, fn mongo_report ->
    mongo_id = MigrationVerifier.extract_mongo_id(mongo_report["_id"])
    pg_report = Repo.get_by(Report, legacy_id: mongo_id)

    if pg_report do
      MigrationVerifier.verify_report(mongo_report, pg_report)
    else
      {:error, "❌ Report not found in PostgreSQL", ["Missing migration"]}
    end
  end)

  Enum.each(report_results, fn
    {:ok, msg} ->
      Logger.info("   #{msg}")
      total_verified = total_verified + 1
    {:error, msg, errors} ->
      Logger.error("   #{msg}")
      Enum.each(errors, &Logger.error("      - #{&1}"))
      total_errors = total_errors + 1
  end)

  # 7. Verify Preferences
  Logger.info("\n⚙️  Verifying Preferences...")
  test_user_ids = Enum.map(1..5, fn i ->
    MigrationVerifier.generate_test_object_id("test_user_#{i}")
  end)

  test_preferences = Mongo.find(conn, "preferences", %{"owner" => %{"$in" => test_user_ids}}) |> Enum.to_list()

  pref_results = Enum.map(test_preferences, fn mongo_pref ->
    mongo_id = MigrationVerifier.extract_mongo_id(mongo_pref["_id"])
    pg_pref = Repo.get_by(Preference, legacy_id: mongo_id)

    if pg_pref do
      MigrationVerifier.verify_preference(mongo_pref, pg_pref)
    else
      {:error, "❌ Preference not found in PostgreSQL", ["Missing migration"]}
    end
  end)

  Enum.each(pref_results, fn
    {:ok, msg} ->
      Logger.info("   #{msg}")
      total_verified = total_verified + 1
    {:error, msg, errors} ->
      Logger.error("   #{msg}")
      Enum.each(errors, &Logger.error("      - #{&1}"))
      total_errors = total_errors + 1
  end)

  # Final Summary
  Logger.info("\n" <> String.duplicate("=", 60))
  if total_errors == 0 do
    Logger.info("✅ ALL VERIFICATIONS PASSED!")
    Logger.info("   #{total_verified} objects verified successfully")
  else
    Logger.error("❌ VERIFICATION FAILED")
    Logger.error("   #{total_verified} passed, #{total_errors} failed")
  end
  Logger.info(String.duplicate("=", 60))

after
  GenServer.stop(conn)
end
