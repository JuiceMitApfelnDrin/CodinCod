# Script for populating the database with test data
#
# Run with: mix run priv/repo/seeds.exs
#
# This will create test users, puzzles, and other data for development

alias CodincodApi.Repo
alias CodincodApi.Accounts
alias CodincodApi.Accounts.User
alias CodincodApi.Puzzles
alias CodincodApi.Puzzles.{Puzzle, PuzzleValidator}
alias CodincodApi.Languages
alias CodincodApi.Languages.ProgrammingLanguage

require Logger

# Helper to safely insert or find existing record
defmodule SeedHelpers do
  def insert_or_find(module, attrs, unique_field) do
    case Repo.get_by(module, [{unique_field, Map.get(attrs, unique_field)}]) do
      nil ->
        %{module.__struct__() | id: Ecto.UUID.generate()}
        |> module.changeset(attrs)
        |> Repo.insert!()

      existing ->
        Logger.info("#{module} with #{unique_field}=#{Map.get(attrs, unique_field)} already exists")
        existing
    end
  end
end

Logger.info("🌱 Starting seed process...")

# ============================================================================
# PROGRAMMING LANGUAGES
# ============================================================================
Logger.info("Creating programming languages...")

languages = [
  %{
    name: "python",
    version: "3.12.0",
    runtime: "python",
    piston_name: "python"
  },
  %{
    name: "javascript",
    version: "18.15.0",
    runtime: "node",
    piston_name: "javascript"
  },
  %{
    name: "ruby",
    version: "3.2.0",
    runtime: "ruby",
    piston_name: "ruby"
  },
  %{
    name: "rust",
    version: "1.68.2",
    runtime: "rust",
    piston_name: "rust"
  },
  %{
    name: "elixir",
    version: "1.14.0",
    runtime: "elixir",
    piston_name: "elixir"
  },
  %{
    name: "go",
    version: "1.21.0",
    runtime: "go",
    piston_name: "go"
  }
]

_created_languages =
  Enum.map(languages, fn lang_attrs ->
    SeedHelpers.insert_or_find(ProgrammingLanguage, lang_attrs, :name)
  end)

# ============================================================================
# TEST USERS
# ============================================================================
Logger.info("Creating test users...")

# Main test user (matches mongo_testdata.py)
codincoder =
  SeedHelpers.insert_or_find(
    User,
    %{
      username: "codincoder",
      email: "codincoder@example.com",
      password: "strongpassword123!",
      password_confirmation: "strongpassword123!",
      profile: %{
        bio: "I love coding challenges!",
        location: "Code City",
        picture: nil,
        socials: %{
          github: "codincoder",
          twitter: "codincoder"
        }
      },
      role: "user"
    },
    :username
  )

# Additional test users for variety
alice =
  SeedHelpers.insert_or_find(
    User,
    %{
      username: "alice",
      email: "alice@example.com",
      password: "alicepassword123!",
      password_confirmation: "alicepassword123!",
      profile: %{
        bio: "Algorithm enthusiast",
        location: "Wonderland"
      },
      role: "user"
    },
    :username
  )

bob =
  SeedHelpers.insert_or_find(
    User,
    %{
      username: "bob",
      email: "bob@example.com",
      password: "bobpassword123!",
      password_confirmation: "bobpassword123!",
      profile: %{
        bio: "Puzzle solver extraordinaire"
      },
      role: "user"
    },
    :username
  )

moderator =
  SeedHelpers.insert_or_find(
    User,
    %{
      username: "moderator",
      email: "moderator@example.com",
      password: "modpassword123!",
      password_confirmation: "modpassword123!",
      profile: %{
        bio: "Keeping the platform safe"
      },
      role: "moderator"
    },
    :username
  )

# ============================================================================
# PUZZLES
# ============================================================================
Logger.info("Creating test puzzles...")

# Easy puzzle - Print 42
easy_puzzle =
  case Repo.get_by(Puzzle, title: "Print 42") do
    nil ->
      puzzle_attrs = %{
        title: "Print 42",
        statement: "Print the number 42.",
        constraints: "No input required",
        difficulty: "BEGINNER",
        visibility: "APPROVED",
        tags: ["beginner", "output"],
        solution: %{
          code: "print(42)",
          language: "python",
          languageVersion: "3.12.0"
        },
        author_id: codincoder.id
      }

      {:ok, puzzle} = Puzzles.create_puzzle(puzzle_attrs)

      # Add validators
      validators = [
        %{input: "", output: "42"},
        %{input: "", output: "42"},
        %{input: "", output: "42"}
      ]

      Enum.each(validators, fn validator_attrs ->
        %PuzzleValidator{}
        |> PuzzleValidator.changeset(Map.put(validator_attrs, :puzzle_id, puzzle.id))
        |> Repo.insert!()
      end)

      puzzle

    existing ->
      Logger.info("Puzzle 'Print 42' already exists")
      existing
  end

# FizzBuzz puzzle (from mongo_testdata.py)
fizzbuzz_puzzle =
  case Repo.get_by(Puzzle, title: "FizzBuzz") do
    nil ->
      puzzle_attrs = %{
        title: "FizzBuzz",
        statement: """
        Print numbers from N to M except for:
        - Every number divisible by 3: print "Fizz"
        - Every number divisible by 5: print "Buzz"
        - Numbers divisible by both 3 and 5: print "FizzBuzz"

        ## Input Format
        Two space-separated integers: N and M

        ## Output Format
        Print each result on a new line.
        """,
        constraints: "0 <= N < M <= 1000",
        difficulty: "INTERMEDIATE",
        visibility: "DRAFT",
        tags: ["loops", "conditionals", "classic"],
        solution: %{
          code: """
          n, m = [int(x) for x in input().split()]
          for i in range(n, m+1):
              fizz = i % 3 == 0
              buzz = i % 5 == 0
              print("Fizz" * fizz + "Buzz" * buzz + str(i) * (not fizz and not buzz))
          """,
          language: "python",
          languageVersion: "3.12.0"
        },
        author_id: codincoder.id
      }

      {:ok, puzzle} = Puzzles.create_puzzle(puzzle_attrs)

      # Add validators
      validators = [
        %{
          input: "1 3",
          output: "1\n2\nFizz"
        },
        %{
          input: "3 5",
          output: "Fizz\n4\nBuzz"
        },
        %{
          input: "1 16",
          output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16"
        }
      ]

      Enum.each(validators, fn validator_attrs ->
        %PuzzleValidator{}
        |> PuzzleValidator.changeset(Map.put(validator_attrs, :puzzle_id, puzzle.id))
        |> Repo.insert!()
      end)

      puzzle

    existing ->
      Logger.info("Puzzle 'FizzBuzz' already exists")
      existing
  end

# Reverse String puzzle
_reverse_puzzle =
  case Repo.get_by(Puzzle, title: "Reverse String") do
    nil ->
      puzzle_attrs = %{
        title: "Reverse String",
        statement: """
        Given a string, output it reversed.

        ## Input Format
        A single line containing the string to reverse.

        ## Output Format
        The reversed string.
        """,
        constraints: "1 <= string length <= 1000",
        difficulty: "EASY",
        visibility: "APPROVED",
        tags: ["strings", "beginner"],
        solution: %{
          code: "print(input()[::-1])",
          language: "python",
          languageVersion: "3.12.0"
        },
        author_id: alice.id
      }

      {:ok, puzzle} = Puzzles.create_puzzle(puzzle_attrs)

      validators = [
        %{input: "hello", output: "olleh"},
        %{input: "world", output: "dlrow"},
        %{input: "racecar", output: "racecar"},
        %{input: "a", output: "a"}
      ]

      Enum.each(validators, fn validator_attrs ->
        %PuzzleValidator{}
        |> PuzzleValidator.changeset(Map.put(validator_attrs, :puzzle_id, puzzle.id))
        |> Repo.insert!()
      end)

      puzzle

    existing ->
      Logger.info("Puzzle 'Reverse String' already exists")
      existing
  end

# Sum of Numbers puzzle
_sum_puzzle =
  case Repo.get_by(Puzzle, title: "Sum of Numbers") do
    nil ->
      puzzle_attrs = %{
        title: "Sum of Numbers",
        statement: """
        Calculate the sum of all integers from 1 to N (inclusive).

        ## Input Format
        A single integer N.

        ## Output Format
        The sum of integers from 1 to N.
        """,
        constraints: "1 <= N <= 10000",
        difficulty: "BEGINNER",
        visibility: "APPROVED",
        tags: ["math", "beginner", "loops"],
        solution: %{
          code: """
          n = int(input())
          print(sum(range(1, n + 1)))
          """,
          language: "python",
          languageVersion: "3.12.0"
        },
        author_id: bob.id
      }

      {:ok, puzzle} = Puzzles.create_puzzle(puzzle_attrs)

      validators = [
        %{input: "1", output: "1"},
        %{input: "5", output: "15"},
        %{input: "10", output: "55"},
        %{input: "100", output: "5050"}
      ]

      Enum.each(validators, fn validator_attrs ->
        %PuzzleValidator{}
        |> PuzzleValidator.changeset(Map.put(validator_attrs, :puzzle_id, puzzle.id))
        |> Repo.insert!()
      end)

      puzzle

    existing ->
      Logger.info("Puzzle 'Sum of Numbers' already exists")
      existing
  end

# Palindrome Check puzzle
_palindrome_puzzle =
  case Repo.get_by(Puzzle, title: "Palindrome Check") do
    nil ->
      puzzle_attrs = %{
        title: "Palindrome Check",
        statement: """
        Determine if a given string is a palindrome.

        A palindrome reads the same forwards and backwards (ignoring case).

        ## Input Format
        A single string.

        ## Output Format
        Print "YES" if it's a palindrome, "NO" otherwise.
        """,
        constraints: "1 <= string length <= 1000",
        difficulty: "EASY",
        visibility: "APPROVED",
        tags: ["strings", "palindrome"],
        solution: %{
          code: """
          s = input().strip().lower()
          print("YES" if s == s[::-1] else "NO")
          """,
          language: "python",
          languageVersion: "3.12.0"
        },
        author_id: alice.id
      }

      {:ok, puzzle} = Puzzles.create_puzzle(puzzle_attrs)

      validators = [
        %{input: "racecar", output: "YES"},
        %{input: "hello", output: "NO"},
        %{input: "A man a plan a canal Panama", output: "NO"},
        %{input: "aabbaa", output: "YES"}
      ]

      Enum.each(validators, fn validator_attrs ->
        %PuzzleValidator{}
        |> PuzzleValidator.changeset(Map.put(validator_attrs, :puzzle_id, puzzle.id))
        |> Repo.insert!()
      end)

      puzzle

    existing ->
      Logger.info("Puzzle 'Palindrome Check' already exists")
      existing
  end

Logger.info("✅ Seed data created successfully!")
Logger.info("   Users: codincoder, alice, bob, moderator")
Logger.info("   Puzzles: 5 puzzles with validators")
Logger.info("   Programming Languages: 6 languages")
