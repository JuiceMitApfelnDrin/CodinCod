#!/usr/bin/env elixir

# Script to seed MongoDB with test data for migration verification
# This creates known test objects that we can verify after migration
#
# Usage:
#   MONGO_URI="..." MONGO_DB_NAME="..." mix run priv/repo/scripts/seed_test_data_mongodb.exs

require Logger

# Deterministic seed for reproducible test data
:rand.seed(:exsplus, {42, 42, 42})

# Generate deterministic test IDs
defmodule TestData do
  def generate_object_id(prefix) do
    # Create deterministic ObjectIds for testing
    # MongoDB ObjectId is 12 bytes (24 hex chars)
    hash = :crypto.hash(:md5, prefix) |> binary_part(0, 12)
    %BSON.ObjectId{value: hash}
  end

  def test_timestamp(days_ago \\ 0) do
    DateTime.utc_now()
    |> DateTime.add(-days_ago * 24 * 3600, :second)
  end

  # Test user data
  def test_user(index) do
    %{
      "_id" => generate_object_id("test_user_#{index}"),
      "username" => "test_user_#{index}",
      "email" => "test#{index}@migration-test.com",
      "password" => "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyJSawHJK7tW", # "password123"
      "role" => if(index == 1, do: "admin", else: "user"),
      "isActive" => true,
      "createdAt" => test_timestamp(30),
      "updatedAt" => test_timestamp(20)
    }
  end

  # Test puzzle data
  def test_puzzle(index, author_id) do
    %{
      "_id" => generate_object_id("test_puzzle_#{index}"),
      "title" => "Test Puzzle #{index}: Two Sum",
      "statement" => "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
      "constraints" => "- Each input has exactly one solution\n- You may not use the same element twice\n- Array length: 2 ≤ n ≤ 10^4",
      "author" => author_id,
      "difficulty" => Enum.at(["beginner", "intermediate", "advanced", "expert"], rem(index, 4)),
      "visibility" => "approved",
      "tags" => ["array", "hash-table", "test-migration"],
      "validators" => [
        %{
          "input" => "[2,7,11,15]\n9",
          "output" => "[0,1]",
          "createdAt" => test_timestamp(25),
          "updatedAt" => test_timestamp(25)
        },
        %{
          "input" => "[3,2,4]\n6",
          "output" => "[1,2]",
          "createdAt" => test_timestamp(25),
          "updatedAt" => test_timestamp(25)
        },
        %{
          "input" => "[3,3]\n6",
          "output" => "[0,1]",
          "createdAt" => test_timestamp(25),
          "updatedAt" => test_timestamp(25)
        }
      ],
      "solution" => %{
        "code" => "def two_sum(nums, target):\n    seen = {}\n    for i, num in enumerate(nums):\n        complement = target - num\n        if complement in seen:\n            return [seen[complement], i]\n        seen[num] = i\n    return []",
        "programmingLanguage" => generate_object_id("lang_python"),
        "explanation" => "Use a hash map to store numbers we've seen and check for complements.",
        "examples" => [
          %{
            "input" => "[2,7,11,15]\n9",
            "output" => "[0,1]",
            "explanation" => "nums[0] + nums[1] = 2 + 7 = 9"
          }
        ]
      },
      "createdAt" => test_timestamp(28),
      "updatedAt" => test_timestamp(15)
    }
  end

  # Test submission data
  def test_submission(index, user_id, puzzle_id) do
    statuses = ["pending", "accepted", "wrong_answer", "runtime_error", "time_limit_exceeded"]
    status = Enum.at(statuses, rem(index, 5))

    %{
      "_id" => generate_object_id("test_submission_#{index}"),
      "user" => user_id,
      "puzzle" => puzzle_id,
      "code" => "def solution(nums, target):\n    # Test submission #{index}\n    return [0, 1]",
      "programmingLanguage" => %{
        "_id" => generate_object_id("lang_python"),
        "name" => "python",
        "version" => "3.11.0"
      },
      "status" => status,
      "result" => %{
        "testResults" => [
          %{"passed" => true, "executionTime" => 45},
          %{"passed" => status == "accepted", "executionTime" => 52},
          %{"passed" => status == "accepted", "executionTime" => 38}
        ],
        "totalTests" => 3,
        "passedTests" => if(status == "accepted", do: 3, else: 1),
        "executionTime" => 135,
        "memoryUsed" => 15_234_567
      },
      "createdAt" => test_timestamp(10 + index),
      "updatedAt" => test_timestamp(10 + index)
    }
  end

  # Test game data
  def test_game(index, player_ids, puzzle_id) do
    [owner_id | _] = player_ids  # First player is the owner

    %{
      "_id" => generate_object_id("test_game_#{index}"),
      "owner" => owner_id,  # Add owner field
      "puzzle" => puzzle_id,
      "players" => player_ids,
      "status" => Enum.at(["waiting", "in_progress", "completed"], rem(index, 3)),
      "mode" => Enum.at(["competitive", "collaborative", "practice"], rem(index, 3)),  # Changed from gameMode
      "visibility" => "public",  # Add visibility
      "options" => %{
        "timeLimit" => 3600,
        "maxPlayers" => length(player_ids),
        "allowLateJoin" => true,
        "showLeaderboard" => true,
        "difficulty" => "intermediate"
      },
      "scores" => Enum.map(player_ids, fn player_id ->
        %{
          "player" => player_id,
          "score" => :rand.uniform(1000),
          "completedAt" => test_timestamp(5)
        }
      end),
      "createdAt" => test_timestamp(12),
      "updatedAt" => test_timestamp(5)
    }
  end

  # Test comment data
  def test_comment(index, author_id, puzzle_id) do
    %{
      "_id" => generate_object_id("test_comment_#{index}"),
      "author" => author_id,
      "puzzle" => puzzle_id,
      "text" => "This is test comment #{index}. Great puzzle! I learned a lot about hash tables.",
      "commentType" => Enum.at(["discussion", "solution", "question"], rem(index, 3)),
      "votes" => %{
        "up" => [author_id],
        "down" => []
      },
      "createdAt" => test_timestamp(8),
      "updatedAt" => test_timestamp(7)
    }
  end

  # Test report data
  def test_report(index, reporter_id, puzzle_id) do
    %{
      "_id" => generate_object_id("test_report_#{index}"),
      "reportedBy" => reporter_id,  # Changed from "reporter" to match schema
      "problematicCollection" => "puzzles",  # Add collection type
      "problematicIdentifier" => puzzle_id,  # Changed from problemReferenceId
      "problemType" => Enum.at(["puzzle", "comment", "user"], rem(index, 3)),
      "problemReferenceSnapshot" => %{
        "title" => "Test Puzzle #{index}",
        "statement" => "Original statement...",
        "capturedAt" => test_timestamp(6)
      },
      "reason" => "Test report #{index}: This content violates community guidelines.",  # Use reason instead of description
      "status" => Enum.at(["pending", "reviewed", "resolved"], rem(index, 3)),
      "createdAt" => test_timestamp(6),
      "updatedAt" => test_timestamp(4)
    }
  end

  # Test preference data
  def test_preference(index, user_id) do
    %{
      "_id" => generate_object_id("test_pref_#{index}"),
      "owner" => user_id,  # MongoDB uses "owner" instead of "user"
      "editor" => %{
        "theme" => Enum.at(["light", "dark", "monokai"], rem(index, 3)),
        "fontSize" => 12 + rem(index, 4),
        "tabSize" => 2 + rem(index, 2),
        "wordWrap" => rem(index, 2) == 0,
        "autoComplete" => true,
        "keyBindings" => "default"
      },
      "notifications" => %{
        "email" => true,
        "push" => false,
        "comments" => true,
        "submissions" => true
      },
      "createdAt" => test_timestamp(15),
      "updatedAt" => test_timestamp(3)
    }
  end
end

# Connect to MongoDB
Logger.info("🔌 Connecting to MongoDB...")

mongo_uri = System.get_env("MONGO_URI") || raise "MONGO_URI environment variable required"
mongo_db = System.get_env("MONGO_DB_NAME") || "codincod-development"

# Parse connection string to check if it's Atlas (mongodb+srv)
is_atlas = String.starts_with?(mongo_uri, "mongodb+srv://")

connect_opts = [
  url: mongo_uri,
  name: :mongo_test_seed,
  database: mongo_db,
  pool_size: 1
]

# Add SSL options for Atlas
connect_opts = if is_atlas do
  Keyword.merge(connect_opts, [
    ssl: true,
    ssl_opts: [verify: :verify_none]
  ])
else
  connect_opts
end

{:ok, conn} = Mongo.start_link(connect_opts)

Logger.info("✅ Connected to MongoDB: #{mongo_db}")
Logger.info("📝 Creating test data with deterministic values...")

# Create test data
try do
  # 1. Create test users (5 users)
  Logger.info("\n👤 Creating test users...")
  test_users = for i <- 1..5, do: TestData.test_user(i)

  # Delete existing test users
  Mongo.delete_many(conn, "users", %{"email" => %{"$regex" => "@migration-test.com"}})

  # Insert test users
  {:ok, _} = Mongo.insert_many(conn, "users", test_users)
  Logger.info("   Created #{length(test_users)} test users")

  # Get user IDs
  user_ids = Enum.map(test_users, & &1["_id"])
  [author_id | other_user_ids] = user_ids

  # 2. Create test puzzles (3 puzzles)
  Logger.info("\n🧩 Creating test puzzles...")
  test_puzzles = for i <- 1..3, do: TestData.test_puzzle(i, author_id)

  Mongo.delete_many(conn, "puzzles", %{"tags" => "test-migration"})
  {:ok, _} = Mongo.insert_many(conn, "puzzles", test_puzzles)
  Logger.info("   Created #{length(test_puzzles)} test puzzles")

  puzzle_ids = Enum.map(test_puzzles, & &1["_id"])
  [puzzle_id | _] = puzzle_ids

  # 3. Create test submissions (10 submissions)
  Logger.info("\n📝 Creating test submissions...")
  test_submissions = for i <- 1..10 do
    TestData.test_submission(
      i,
      Enum.at(user_ids, rem(i, length(user_ids))),
      Enum.at(puzzle_ids, rem(i, length(puzzle_ids)))
    )
  end

  # Delete test submissions
  submission_ids = Enum.map(test_submissions, & &1["_id"])
  Mongo.delete_many(conn, "submissions", %{"_id" => %{"$in" => submission_ids}})

  {:ok, _} = Mongo.insert_many(conn, "submissions", test_submissions)
  Logger.info("   Created #{length(test_submissions)} test submissions")

  # 4. Create test games (4 games)
  Logger.info("\n🎮 Creating test games...")
  test_games = for i <- 1..4 do
    player_count = 2 + rem(i, 3)
    players = Enum.take(user_ids, player_count)
    TestData.test_game(i, players, Enum.at(puzzle_ids, rem(i, length(puzzle_ids))))
  end

  game_ids = Enum.map(test_games, & &1["_id"])
  Mongo.delete_many(conn, "games", %{"_id" => %{"$in" => game_ids}})

  {:ok, _} = Mongo.insert_many(conn, "games", test_games)
  Logger.info("   Created #{length(test_games)} test games")

  # 5. Create test comments (6 comments)
  Logger.info("\n💬 Creating test comments...")
  test_comments = for i <- 1..6 do
    TestData.test_comment(
      i,
      Enum.at(user_ids, rem(i, length(user_ids))),
      Enum.at(puzzle_ids, rem(i, length(puzzle_ids)))
    )
  end

  comment_ids = Enum.map(test_comments, & &1["_id"])
  Mongo.delete_many(conn, "comments", %{"_id" => %{"$in" => comment_ids}})

  {:ok, _} = Mongo.insert_many(conn, "comments", test_comments)
  Logger.info("   Created #{length(test_comments)} test comments")

  # 6. Create test reports (3 reports)
  Logger.info("\n🚩 Creating test reports...")
  test_reports = for i <- 1..3 do
    TestData.test_report(i, author_id, Enum.at(puzzle_ids, rem(i, length(puzzle_ids))))
  end

  report_ids = Enum.map(test_reports, & &1["_id"])
  Mongo.delete_many(conn, "reports", %{"_id" => %{"$in" => report_ids}})

  {:ok, _} = Mongo.insert_many(conn, "reports", test_reports)
  Logger.info("   Created #{length(test_reports)} test reports")

  # 7. Create test preferences (5 preferences - one per user)
  Logger.info("\n⚙️  Creating test preferences...")
  test_preferences = for i <- 1..5 do
    TestData.test_preference(i, Enum.at(user_ids, i - 1))
  end

  # Delete existing test preferences by ID
  pref_ids = Enum.map(test_preferences, & &1["_id"])
  Mongo.delete_many(conn, "preferences", %{"_id" => %{"$in" => pref_ids}})
  Mongo.delete_many(conn, "preferences", %{"owner" => %{"$in" => user_ids}})

  {:ok, _} = Mongo.insert_many(conn, "preferences", test_preferences)
  Logger.info("   Created #{length(test_preferences)} test preferences")

  # Summary
  Logger.info("\n" <> String.duplicate("=", 60))
  Logger.info("✅ Test Data Creation Complete!")
  Logger.info(String.duplicate("=", 60))
  Logger.info("📊 Summary:")
  Logger.info("   • Users:       #{length(test_users)}")
  Logger.info("   • Puzzles:     #{length(test_puzzles)}")
  Logger.info("   • Submissions: #{length(test_submissions)}")
  Logger.info("   • Games:       #{length(test_games)}")
  Logger.info("   • Comments:    #{length(test_comments)}")
  Logger.info("   • Reports:     #{length(test_reports)}")
  Logger.info("   • Preferences: #{length(test_preferences)}")
  Logger.info("   " <> String.duplicate("-", 58))
  Logger.info("   Total:         #{length(test_users) + length(test_puzzles) + length(test_submissions) + length(test_games) + length(test_comments) + length(test_reports) + length(test_preferences)}")
  Logger.info(String.duplicate("=", 60))
  Logger.info("\n🚀 Ready for migration testing!")
  Logger.info("   Run: mix migrate_mongo")

after
  GenServer.stop(conn)
end
