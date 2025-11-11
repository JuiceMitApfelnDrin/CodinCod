defmodule CodincodApiWeb.UserControllerTest do
  use CodincodApiWeb.ConnCase, async: true

  import Ecto.Changeset

  alias CodincodApi.Accounts.{Password, User}
  alias CodincodApi.Puzzles.Puzzle
  alias CodincodApi.Repo

  @valid_password "Sup3rSecurePass!"

  describe "GET /api/user/:username" do
    test "returns user details", %{conn: conn} do
      user = insert_user!(%{username: "ada", email: "ada@example.com"})

      response =
        conn
        |> get(~p"/api/user/#{user.username}")
        |> json_response(200)

      assert response["message"] == "User found"
      assert response["user"]["id"] == user.id
      assert response["user"]["username"] == user.username
    end

    test "returns 404 when user missing", %{conn: conn} do
      response =
        conn
        |> get(~p"/api/user/missing-user")
        |> json_response(404)

      assert response["message"] == "User not found"
    end
  end

  describe "GET /api/user/:username/isAvailable" do
    test "reports username availability", %{conn: conn} do
      insert_user!(%{username: "lovelace"})

      response =
        conn
        |> get(~p"/api/user/lovelace/isAvailable")
        |> json_response(200)

      refute response["available"]

      response =
        conn
        |> get(~p"/api/user/newhandle/isAvailable")
        |> json_response(200)

      assert response["available"]
    end
  end

  describe "GET /api/user/:username/puzzle" do
    test "paginates public puzzles for non-owners", %{conn: conn} do
      author = insert_user!(%{username: "puzzler"})

      insert_puzzle!(author, %{title: "Approved Puzzle", visibility: "APPROVED"})
      insert_puzzle!(author, %{title: "Draft Puzzle", visibility: "DRAFT"})

      response =
        conn
        |> get(~p"/api/user/#{author.username}/puzzle", %{page: 1, pageSize: 10})
        |> json_response(200)

      assert response["totalItems"] == 1
      [puzzle] = response["items"]
      assert puzzle["title"] == "Approved Puzzle"
      assert puzzle["visibility"] == "approved"

      # Ensure hitting the /api route remains compatible
      response_legacy =
        conn
        |> get(~p"/api/user/#{author.username}/puzzle", %{page: 1, pageSize: 10})
        |> json_response(200)

      assert response_legacy["totalItems"] == 1
    end
  end

  describe "GET /api/user/:username/activity" do
    test "returns public activity", %{conn: conn} do
      author = insert_user!(%{username: "activity"})
      language = insert_language!(%{language: "elixir", version: "1.16"})
      puzzle = insert_puzzle!(author, %{title: "Activity Puzzle", visibility: "APPROVED"})

      insert_submission!(author, puzzle, language)

      response =
        conn
        |> get(~p"/api/user/#{author.username}/activity")
        |> json_response(200)

      assert response["message"] == "User activity found"
      assert length(response["activity"]["puzzles"]) == 1
      assert length(response["activity"]["submissions"]) == 1
    end
  end

  defp insert_user!(attrs) do
    base_attrs = %{
      username: "tester" <> unique_suffix(),
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

  defp insert_puzzle!(%User{id: author_id}, attrs) do
    %Puzzle{}
    |> change(%{
      title: Map.get(attrs, :title, "Sample Puzzle #{unique_suffix()}"),
      statement: "Solve it!",
      constraints: nil,
      author_id: author_id,
      difficulty: Map.get(attrs, :difficulty, "BEGINNER"),
      visibility: Map.get(attrs, :visibility, "APPROVED"),
      tags: [],
      solution: %{}
    })
    |> Repo.insert!()
  end

  defp insert_language!(attrs) do
    %CodincodApi.Languages.ProgrammingLanguage{}
    |> change(%{
      language: Map.get(attrs, :language, "elixir"),
      version: Map.get(attrs, :version, "1.16"),
      aliases: [],
      runtime: Map.get(attrs, :runtime, "elixir"),
      is_active: true
    })
    |> Repo.insert!()
  end

  defp insert_submission!(%User{id: user_id}, %Puzzle{id: puzzle_id}, language) do
    %CodincodApi.Submissions.Submission{}
    |> change(%{
      user_id: user_id,
      puzzle_id: puzzle_id,
      programming_language_id: language.id,
      code: "IO.puts(:hello)",
      result: %{"status" => "success"}
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
