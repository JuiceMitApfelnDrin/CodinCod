defmodule CodincodApiWeb.SubmissionControllerTest do
  use CodincodApiWeb.ConnCase, async: true

  import Ecto.Changeset

  alias CodincodApi.Accounts.{Password, User}
  alias CodincodApi.Languages.ProgrammingLanguage
  alias CodincodApi.Puzzles.{Puzzle, PuzzleValidator}
  alias CodincodApi.Submissions.Submission
  alias CodincodApi.Repo

  @valid_password "Sup3rSecurePass!"

  setup %{conn: conn} do
    user = insert_user!(%{username: "submitter"})
    {:ok, token, _claims} = CodincodApiWeb.Auth.Guardian.generate_token(user)

    authed_conn =
      conn
      |> put_req_header("accept", "application/json")
      |> put_req_header("content-type", "application/json")
      |> put_req_header("authorization", "Bearer #{token}")

    on_exit(fn ->
      Application.delete_env(:codincod_api, :piston_mock_execute)
    end)

    {:ok, conn: authed_conn, user: user}
  end

  describe "POST /api/submission" do
    test "creates a submission and returns result summary", %{conn: conn, user: user} do
      language = insert_language!(%{language: "python", version: "3.10.0", runtime: "python"})
      author = insert_user!(%{username: "puzzle-author"})
      puzzle = insert_puzzle!(author, %{title: "Echo Puzzle"})
      insert_validator!(puzzle, %{input: "hello", output: "hello"})

      body = %{
        "puzzleId" => puzzle.id,
        "programmingLanguageId" => language.id,
        "code" => "print('hello')",
        "userId" => user.id
      }

      response =
        conn
        |> post(~p"/api/submission", body)
        |> json_response(201)

      assert response["puzzleId"] == puzzle.id
      assert response["programmingLanguageId"] == language.id
      assert response["userId"] == user.id
      assert response["codeLength"] == String.length(body["code"])

      assert %{"successRate" => 1.0, "passed" => 1, "failed" => 0, "total" => 1} =
               response["result"]

      submission = Repo.get!(Submission, response["submissionId"])
      assert submission.result["result"] == "success"
      assert submission.result["successRate"] == 1.0
    end

    test "returns 404 when puzzle is missing", %{conn: conn, user: user} do
      language = insert_language!(%{language: "python", version: "3.10.0", runtime: "python"})
      missing_id = Ecto.UUID.generate()

      body = %{
        "puzzleId" => missing_id,
        "programmingLanguageId" => language.id,
        "code" => "print('oops')",
        "userId" => user.id
      }

      response =
        conn
        |> post(~p"/api/submission", body)
        |> json_response(404)

      assert response["error"] == "Puzzle not found"
    end

    test "returns 400 when puzzle lacks validators", %{conn: conn, user: user} do
      language = insert_language!(%{language: "python", version: "3.10.0", runtime: "python"})
      author = insert_user!(%{username: "no-validators"})
      puzzle = insert_puzzle!(author, %{title: "Incomplete Puzzle"})

      body = %{
        "puzzleId" => puzzle.id,
        "programmingLanguageId" => language.id,
        "code" => "print('test')",
        "userId" => user.id
      }

      response =
        conn
        |> post(~p"/api/submission", body)
        |> json_response(400)

      assert response["error"] == "Failed to update the puzzle"
    end
  end

  describe "GET /api/submission/:id" do
    test "returns submission details", %{conn: conn, user: user} do
      language = insert_language!(%{language: "python", version: "3.10.0", runtime: "python"})
      author = insert_user!(%{username: "puzzle-owner"})
      puzzle = insert_puzzle!(author, %{title: "Stored Puzzle"})

      submission =
        %Submission{}
        |> change(%{
          user_id: user.id,
          puzzle_id: puzzle.id,
          programming_language_id: language.id,
          code: "print('stored')",
          result: %{
            "result" => "success",
            "successRate" => 1.0,
            "passed" => 1,
            "failed" => 0,
            "total" => 1
          }
        })
        |> Repo.insert!()
        |> Repo.preload([:programming_language, :puzzle, :user])

      response =
        conn
        |> get(~p"/api/submission/#{submission.id}")
        |> json_response(200)

      assert response["id"] == submission.id
      assert response["code"] == submission.code
      assert response["programmingLanguage"]["id"] == submission.programming_language_id
      assert response["user"]["id"] == user.id
    end
  end

  defp insert_user!(attrs) do
    base_attrs = %{
      username: "user" <> unique_suffix(),
      email: unique_email(),
      profile: %{},
      role: "user"
    }

    attrs = Map.merge(base_attrs, attrs)

    {:ok, password_hash} = Password.hash(@valid_password)

    %User{}
    |> change(%{
      username: attrs.username,
      email: attrs.email,
      profile: attrs.profile,
      role: attrs.role,
      password_hash: password_hash
    })
    |> Repo.insert!()
  end

  defp insert_language!(attrs) do
    %ProgrammingLanguage{}
    |> change(%{
      language: Map.get(attrs, :language, "python"),
      version: Map.get(attrs, :version, "3.10.0"),
      runtime: Map.get(attrs, :runtime, "python"),
      aliases: Map.get(attrs, :aliases, []),
      is_active: Map.get(attrs, :is_active, true)
    })
    |> Repo.insert!()
  end

  defp insert_puzzle!(%User{id: author_id}, attrs) do
    %Puzzle{}
    |> change(%{
      title: Map.get(attrs, :title, "Puzzle #{unique_suffix()}"),
      statement: Map.get(attrs, :statement, "Solve me"),
      constraints: Map.get(attrs, :constraints, nil),
      author_id: author_id,
      difficulty: Map.get(attrs, :difficulty, "BEGINNER"),
      visibility: Map.get(attrs, :visibility, "APPROVED"),
      tags: [],
      solution: %{}
    })
    |> Repo.insert!()
  end

  defp insert_validator!(%Puzzle{id: puzzle_id}, attrs) do
    %PuzzleValidator{}
    |> change(%{
      puzzle_id: puzzle_id,
      input: Map.get(attrs, :input, ""),
      output: Map.get(attrs, :output, ""),
      is_public: Map.get(attrs, :is_public, false)
    })
    |> Repo.insert!()
  end

  defp unique_suffix do
    System.unique_integer([:positive]) |> Integer.to_string()
  end

  defp unique_email do
    "user-" <> unique_suffix() <> "@example.com"
  end
end
