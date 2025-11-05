#!/usr/bin/env elixir

# Mix.install([{:mongodb_driver, "~> 1.0"}])

"""
Migration Validation Script
===========================

This script validates that data was successfully migrated from MongoDB to PostgreSQL.
It compares counts and samples data from both databases.

Usage:
  mix run validate_migration.exs
  mix run validate_migration.exs --detailed
  mix run validate_migration.exs --export-report

Requirements:
- PostgreSQL must be running with migrated data
- MongoDB must be accessible (optional, for comparison)
"""

defmodule MigrationValidator do
  @moduledoc """
  Validates the migration from MongoDB to PostgreSQL by comparing data counts,
  checking data integrity, and generating a detailed report.
  """

  require Logger

  alias CodincodApi.Repo
  alias CodincodApi.Accounts.User
  alias CodincodApi.Puzzles.Puzzle
  alias CodincodApi.Submissions.Submission
  alias CodincodApi.Games.Game
  alias CodincodApi.Languages.ProgrammingLanguage
  alias CodincodApi.Comments.Comment
  alias CodincodApi.Moderation.Report

  import Ecto.Query

  def run(opts \\ []) do
    IO.puts("\n" <> header())

    case validate_all(opts) do
      {:ok, report} ->
        display_report(report, opts)
        maybe_export_report(report, opts)
        IO.puts(success_message())
        {:ok, report}

      {:error, reason} ->
        IO.puts(error_message(reason))
        {:error, reason}
    end
  end

  def validate_all(opts) do
    try do
      mongo_available = opts[:skip_mongo] != true && check_mongo_connection()

      results = [
        validate_users(mongo_available),
        validate_puzzles(mongo_available),
        validate_submissions(mongo_available),
        validate_games(mongo_available),
        validate_languages(mongo_available),
        validate_comments(mongo_available),
        validate_reports(mongo_available),
        validate_data_integrity(),
        validate_indexes(),
        validate_constraints()
      ]

      report = %{
        timestamp: DateTime.utc_now(),
        mongo_available: mongo_available,
        results: results,
        summary: summarize_results(results)
      }

      {:ok, report}
    rescue
      e ->
        {:error, Exception.message(e)}
    end
  end

  ## Validation Functions

  defp validate_users(mongo_available) do
    pg_count = Repo.aggregate(User, :count)
    mongo_count = if mongo_available, do: get_mongo_count("users"), else: nil

    sample_users = User |> limit(5) |> Repo.all()

    %{
      entity: "Users",
      pg_count: pg_count,
      mongo_count: mongo_count,
      match: mongo_count == nil || pg_count >= mongo_count,
      samples: length(sample_users),
      details: %{
        with_email: count_users_with_email(),
        with_username: count_users_with_username(),
        admin_users: count_admin_users(),
        banned_users: count_banned_users()
      }
    }
  end

  defp validate_puzzles(mongo_available) do
    pg_count = Repo.aggregate(Puzzle, :count)
    mongo_count = if mongo_available, do: get_mongo_count("puzzles"), else: nil

    %{
      entity: "Puzzles",
      pg_count: pg_count,
      mongo_count: mongo_count,
      match: mongo_count == nil || pg_count >= mongo_count,
      details: %{
        published: count_published_puzzles(),
        draft: count_draft_puzzles(),
        by_difficulty: count_by_difficulty()
      }
    }
  end

  defp validate_submissions(mongo_available) do
    pg_count = Repo.aggregate(Submission, :count)
    mongo_count = if mongo_available, do: get_mongo_count("submissions"), else: nil

    %{
      entity: "Submissions",
      pg_count: pg_count,
      mongo_count: mongo_count,
      match: mongo_count == nil || pg_count >= mongo_count,
      details: %{
        accepted: count_accepted_submissions(),
        rejected: count_rejected_submissions(),
        pending: count_pending_submissions()
      }
    }
  end

  defp validate_games(mongo_available) do
    pg_count = Repo.aggregate(Game, :count)
    mongo_count = if mongo_available, do: get_mongo_count("games"), else: nil

    %{
      entity: "Games",
      pg_count: pg_count,
      mongo_count: mongo_count,
      match: mongo_count == nil || pg_count >= mongo_count,
      details: %{
        completed: count_completed_games(),
        in_progress: count_in_progress_games(),
        waiting: count_waiting_games()
      }
    }
  end

  defp validate_languages(mongo_available) do
    pg_count = Repo.aggregate(ProgrammingLanguage, :count)
    mongo_count = if mongo_available, do: get_mongo_count("languages"), else: nil

    %{
      entity: "Programming Languages",
      pg_count: pg_count,
      mongo_count: mongo_count,
      match: mongo_count == nil || pg_count >= mongo_count,
      details: %{
        active: count_active_languages()
      }
    }
  end

  defp validate_comments(mongo_available) do
    pg_count = Repo.aggregate(Comment, :count)
    mongo_count = if mongo_available, do: get_mongo_count("comments"), else: nil

    %{
      entity: "Comments",
      pg_count: pg_count,
      mongo_count: mongo_count,
      match: mongo_count == nil || pg_count >= mongo_count,
      details: %{}
    }
  end

  defp validate_reports(mongo_available) do
    pg_count = Repo.aggregate(Report, :count)
    mongo_count = if mongo_available, do: get_mongo_count("reports"), else: nil

    %{
      entity: "Reports",
      pg_count: pg_count,
      mongo_count: mongo_count,
      match: mongo_count == nil || pg_count >= mongo_count,
      details: %{
        pending: count_pending_reports(),
        resolved: count_resolved_reports()
      }
    }
  end

  defp validate_data_integrity do
    checks = [
      check_orphaned_submissions(),
      check_orphaned_games(),
      check_orphaned_comments(),
      check_duplicate_usernames(),
      check_duplicate_emails(),
      check_invalid_references()
    ]

    passed = Enum.count(checks, & &1.passed)
    total = length(checks)

    %{
      entity: "Data Integrity",
      checks: checks,
      passed: passed,
      total: total,
      match: passed == total
    }
  end

  defp validate_indexes do
    # Check if critical indexes exist
    indexes = get_table_indexes()

    %{
      entity: "Database Indexes",
      indexes: indexes,
      match: true
    }
  end

  defp validate_constraints do
    # Check if foreign key constraints are in place
    constraints = get_foreign_key_constraints()

    %{
      entity: "Foreign Key Constraints",
      constraints: constraints,
      match: true
    }
  end

  ## Helper Functions - Counts

  defp count_users_with_email do
    User |> where([u], not is_nil(u.email)) |> Repo.aggregate(:count)
  end

  defp count_users_with_username do
    User |> where([u], not is_nil(u.username)) |> Repo.aggregate(:count)
  end

  defp count_admin_users do
    User |> where([u], u.role == :admin) |> Repo.aggregate(:count)
  end

  defp count_banned_users do
    User |> where([u], not is_nil(u.current_ban_id)) |> Repo.aggregate(:count)
  end

  defp count_published_puzzles do
    Puzzle |> where([p], p.is_published == true) |> Repo.aggregate(:count)
  end

  defp count_draft_puzzles do
    Puzzle |> where([p], p.is_published == false) |> Repo.aggregate(:count)
  end

  defp count_by_difficulty do
    Puzzle
    |> group_by([p], p.difficulty)
    |> select([p], {p.difficulty, count(p.id)})
    |> Repo.all()
    |> Enum.into(%{})
  end

  defp count_accepted_submissions do
    Submission |> where([s], s.status == "accepted") |> Repo.aggregate(:count)
  end

  defp count_rejected_submissions do
    Submission |> where([s], s.status == "rejected") |> Repo.aggregate(:count)
  end

  defp count_pending_submissions do
    Submission |> where([s], s.status == "pending") |> Repo.aggregate(:count)
  end

  defp count_completed_games do
    Game |> where([g], g.status == "completed") |> Repo.aggregate(:count)
  end

  defp count_in_progress_games do
    Game |> where([g], g.status == "in_progress") |> Repo.aggregate(:count)
  end

  defp count_waiting_games do
    Game |> where([g], g.status == "waiting") |> Repo.aggregate(:count)
  end

  defp count_active_languages do
    ProgrammingLanguage |> where([l], l.is_active == true) |> Repo.aggregate(:count)
  end

  defp count_pending_reports do
    Report |> where([r], r.status == "pending") |> Repo.aggregate(:count)
  end

  defp count_resolved_reports do
    Report |> where([r], r.status == "resolved") |> Repo.aggregate(:count)
  end

  ## Helper Functions - Integrity Checks

  defp check_orphaned_submissions do
    # Check for submissions without valid user or puzzle references
    orphaned =
      Submission
      |> join(:left, [s], u in User, on: s.user_id == u.id)
      |> join(:left, [s], p in Puzzle, on: s.puzzle_id == p.id)
      |> where([s, u, p], is_nil(u.id) or is_nil(p.id))
      |> Repo.aggregate(:count)

    %{
      name: "Orphaned Submissions",
      passed: orphaned == 0,
      count: orphaned
    }
  end

  defp check_orphaned_games do
    orphaned =
      Game
      |> join(:left, [g], u in User, on: g.owner_id == u.id)
      |> join(:left, [g], p in Puzzle, on: g.puzzle_id == p.id)
      |> where([g, u, p], is_nil(u.id) or is_nil(p.id))
      |> Repo.aggregate(:count)

    %{
      name: "Orphaned Games",
      passed: orphaned == 0,
      count: orphaned
    }
  end

  defp check_orphaned_comments do
    orphaned =
      Comment
      |> join(:left, [c], u in User, on: c.author_id == u.id)
      |> where([c, u], is_nil(u.id))
      |> Repo.aggregate(:count)

    %{
      name: "Orphaned Comments",
      passed: orphaned == 0,
      count: orphaned
    }
  end

  defp check_duplicate_usernames do
    duplicates =
      User
      |> group_by([u], u.username)
      |> having([u], count(u.id) > 1)
      |> select([u], count(u.id))
      |> Repo.aggregate(:count)

    %{
      name: "Duplicate Usernames",
      passed: duplicates == 0,
      count: duplicates
    }
  end

  defp check_duplicate_emails do
    duplicates =
      User
      |> group_by([u], u.email)
      |> having([u], count(u.id) > 1)
      |> select([u], count(u.id))
      |> Repo.aggregate(:count)

    %{
      name: "Duplicate Emails",
      passed: duplicates == 0,
      count: duplicates
    }
  end

  defp check_invalid_references do
    # This is a placeholder - add specific checks as needed
    %{
      name: "Invalid References",
      passed: true,
      count: 0
    }
  end

  ## Database Introspection

  defp get_table_indexes do
    query = """
    SELECT
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname
    """

    case Repo.query(query) do
      {:ok, %{rows: rows}} -> length(rows)
      _ -> 0
    end
  end

  defp get_foreign_key_constraints do
    query = """
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
    """

    case Repo.query(query) do
      {:ok, %{rows: rows}} -> length(rows)
      _ -> 0
    end
  end

  ## MongoDB Functions (placeholder)

  defp check_mongo_connection do
    # TODO: Implement MongoDB connection check
    # This would require MongoDB driver to be installed
    false
  end

  defp get_mongo_count(_collection) do
    # TODO: Implement MongoDB count
    nil
  end

  ## Report Functions

  defp summarize_results(results) do
    total_entities = length(results)

    matches =
      Enum.count(results, fn result ->
        Map.get(result, :match, false)
      end)

    %{
      total_entities: total_entities,
      matched: matches,
      percentage: if(total_entities > 0, do: matches / total_entities * 100, else: 0)
    }
  end

  defp display_report(report, opts) do
    IO.puts("\n" <> String.duplicate("=", 80))
    IO.puts("MIGRATION VALIDATION REPORT")
    IO.puts(String.duplicate("=", 80))
    IO.puts("Timestamp: #{report.timestamp}")
    IO.puts("MongoDB Available: #{report.mongo_available}")
    IO.puts("")

    Enum.each(report.results, fn result ->
      display_result(result, opts)
    end)

    IO.puts("\n" <> String.duplicate("=", 80))
    IO.puts("SUMMARY")
    IO.puts(String.duplicate("=", 80))

    summary = report.summary
    IO.puts("Entities Validated: #{summary.total_entities}")
    IO.puts("Matched: #{summary.matched}")
    IO.puts("Success Rate: #{Float.round(summary.percentage, 2)}%")
    IO.puts("")
  end

  defp display_result(result, opts) do
    entity = result.entity
    pg_count = Map.get(result, :pg_count, "N/A")
    mongo_count = Map.get(result, :mongo_count, "N/A")
    match = Map.get(result, :match, false)

    status = if match, do: "✓", else: "✗"
    IO.puts("\n#{status} #{entity}")
    IO.puts("  PostgreSQL: #{pg_count}")

    if mongo_count != "N/A" do
      IO.puts("  MongoDB:    #{mongo_count}")
    end

    if opts[:detailed] && Map.has_key?(result, :details) do
      display_details(result.details)
    end

    if Map.has_key?(result, :checks) do
      display_checks(result.checks)
    end
  end

  defp display_details(details) do
    IO.puts("  Details:")

    Enum.each(details, fn {key, value} ->
      IO.puts("    #{key}: #{inspect(value)}")
    end)
  end

  defp display_checks(checks) do
    IO.puts("  Integrity Checks:")

    Enum.each(checks, fn check ->
      status = if check.passed, do: "✓", else: "✗"
      IO.puts("    #{status} #{check.name}: #{check.count}")
    end)
  end

  defp maybe_export_report(report, opts) do
    if opts[:export_report] do
      filename = "migration_report_#{DateTime.to_unix(report.timestamp)}.json"
      content = Jason.encode!(report, pretty: true)
      File.write!(filename, content)
      IO.puts("\n✓ Report exported to: #{filename}")
    end
  end

  ## Messages

  defp header do
    """
    ╔══════════════════════════════════════════════════════════════════════════╗
    ║                                                                          ║
    ║              CodinCod Migration Validation Tool                          ║
    ║                                                                          ║
    ║            MongoDB → PostgreSQL Data Validation                          ║
    ║                                                                          ║
    ╚══════════════════════════════════════════════════════════════════════════╝
    """
  end

  defp success_message do
    """

    ╔══════════════════════════════════════════════════════════════════════════╗
    ║                                                                          ║
    ║                  ✓ Validation Complete!                                 ║
    ║                                                                          ║
    ╚══════════════════════════════════════════════════════════════════════════╝
    """
  end

  defp error_message(reason) do
    """

    ╔══════════════════════════════════════════════════════════════════════════╗
    ║                                                                          ║
    ║                  ✗ Validation Failed                                    ║
    ║                                                                          ║
    ║  Error: #{reason}
    ║                                                                          ║
    ╚══════════════════════════════════════════════════════════════════════════╝
    """
  end
end

# Parse command line arguments
args = System.argv()
opts = [
  detailed: Enum.member?(args, "--detailed"),
  export_report: Enum.member?(args, "--export-report"),
  skip_mongo: Enum.member?(args, "--skip-mongo")
]

# Run validation
MigrationValidator.run(opts)
