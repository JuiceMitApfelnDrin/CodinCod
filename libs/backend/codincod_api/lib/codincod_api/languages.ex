defmodule CodincodApi.Languages do
  @moduledoc """
  Context for managing programming languages leveraged by submissions and puzzles.
  """

  import Ecto.Query, warn: false
  alias CodincodApi.Repo

  alias CodincodApi.Languages.ProgrammingLanguage

  @doc """
  Lists all active programming languages sorted by display order and name.
  """
  def list_languages(opts \\ []) do
    include_inactive = Keyword.get(opts, :include_inactive, false)

    ProgrammingLanguage
    |> where([pl], pl.is_active == true or ^include_inactive)
    |> order_by([pl], asc_nulls_last: pl.display_order, asc: pl.language, asc: pl.version)
    |> Repo.all()
  end

  @doc """
  Retrieves a language by identifier.
  """
  def get_language!(id), do: Repo.get!(ProgrammingLanguage, id)

  @spec get_language(Ecto.UUID.t()) :: ProgrammingLanguage.t() | nil
  def get_language(id), do: Repo.get(ProgrammingLanguage, id)

  @spec fetch_language(Ecto.UUID.t()) :: {:ok, ProgrammingLanguage.t()} | {:error, :not_found}
  def fetch_language(id) do
    case get_language(id) do
      nil -> {:error, :not_found}
      language -> {:ok, language}
    end
  end

  def upsert_language(attrs) do
    %ProgrammingLanguage{}
    |> ProgrammingLanguage.changeset(attrs)
    |> Repo.insert(
      conflict_target: [:language, :version],
      on_conflict: {:replace_all_except, [:id, :inserted_at]}
    )
  end
end
