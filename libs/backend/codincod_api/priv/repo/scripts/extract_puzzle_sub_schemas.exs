# Script to extract test cases and examples from puzzle.solution JSONB field
# into their own tables (puzzle_test_cases and puzzle_examples)
#
# Run with: mix run priv/repo/scripts/extract_puzzle_sub_schemas.exs

require Logger

alias CodincodApi.Repo
alias CodincodApi.Puzzles.{Puzzle, PuzzleTestCase, PuzzleExample}

import Ecto.Query

Logger.info("🔄 Extracting puzzle test cases and examples...")

# Get all puzzles with solution data
puzzles_with_solutions =
  from(p in Puzzle,
    where: not is_nil(p.solution),
    where: p.solution != ^%{},
    preload: [:test_cases, :examples]
  )
  |> Repo.all()

Logger.info("Found #{length(puzzles_with_solutions)} puzzles with solution data")

Enum.each(puzzles_with_solutions, fn puzzle ->
  solution = puzzle.solution || %{}

  # Extract test cases
  test_cases = solution["testCases"] || []
  Logger.info("  Processing puzzle '#{puzzle.title}' - #{length(test_cases)} test cases, #{length(solution["examples"] || [])} examples")

  test_cases
  |> Enum.with_index()
  |> Enum.each(fn {tc, idx} ->
    legacy_id = "#{puzzle.legacy_id}_tc_#{idx}"

    # Skip if already exists
    unless Repo.get_by(PuzzleTestCase, legacy_id: legacy_id) do
      attrs = %{
        puzzle_id: puzzle.id,
        input: tc["input"] || "",
        expected_output: tc["expectedOutput"] || tc["output"] || "",
        is_sample: tc["isSample"] || false,
        order: idx,
        legacy_id: legacy_id,
        metadata: %{}
      }

      case PuzzleTestCase.changeset(%PuzzleTestCase{}, attrs) |> Repo.insert() do
        {:ok, _} -> :ok
        {:error, changeset} ->
          Logger.warning("    Failed to insert test case #{idx}: #{inspect(changeset.errors)}")
      end
    end
  end)

  # Extract examples
  examples = solution["examples"] || []

  examples
  |> Enum.with_index()
  |> Enum.each(fn {ex, idx} ->
    legacy_id = "#{puzzle.legacy_id}_ex_#{idx}"

    # Skip if already exists
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
          Logger.warning("    Failed to insert example #{idx}: #{inspect(changeset.errors)}")
      end
    end
  end)
end)

# Count results
test_case_count = Repo.aggregate(PuzzleTestCase, :count)
example_count = Repo.aggregate(PuzzleExample, :count)

Logger.info("✅ Extraction complete!")
Logger.info("   Total test cases: #{test_case_count}")
Logger.info("   Total examples: #{example_count}")
