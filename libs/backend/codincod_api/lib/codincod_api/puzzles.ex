defmodule CodincodApi.Puzzles do
  @moduledoc """
  Puzzle context that encapsulates authoring flows, moderation transitions and
  validator management.
  """

  import Ecto.Query, warn: false
  alias Ecto.Multi
  alias CodincodApi.Repo

  alias CodincodApi.Puzzles.{Puzzle, PuzzleValidator, PuzzleMetric}

  @default_page 1
  @default_page_size 20
  @min_page 1
  @min_page_size 1
  @max_page_size 100

  @type puzzle_params :: map()
  @type pagination_opts :: %{optional(:page) => integer(), optional(:page_size) => integer()}

  @doc """
  Paginate puzzles mirroring the Fastify `/puzzle` index route behaviour.

  Ensures bounds on `page` and `page_size`, preloads associations required by the
  API and returns the aggregated counts needed for the paginated response.
  """
  @spec paginate_all(pagination_opts() | keyword()) :: %{
          items: [Puzzle.t()],
          page: pos_integer(),
          page_size: pos_integer(),
          total_items: non_neg_integer(),
          total_pages: non_neg_integer()
        }
  def paginate_all(params \\ %{}) do
    %{page: page, page_size: page_size} = normalize_pagination(params)

    offset = (page - 1) * page_size

    items =
      base_query()
      |> order_by([p], desc: p.inserted_at)
      |> limit(^page_size)
      |> offset(^offset)
      |> Repo.all()

    total_items = Repo.aggregate(from(p in Puzzle), :count, :id)

    total_pages =
      if total_items == 0 do
        0
      else
        total_items
        |> Kernel./(page_size)
        |> Float.ceil()
        |> trunc()
      end

    %{
      items: items,
      page: page,
      page_size: page_size,
      total_items: total_items,
      total_pages: total_pages
    }
  end

  @doc """
  Paginate puzzles authored by a specific user while applying visibility rules.

  Mirrors the behaviour of the Fastify `/user/:username/puzzle` route where the
  owner can see all of their puzzles, but other viewers are limited to
  `approved` visibility.
  """
  @spec paginate_for_author(Ecto.UUID.t(), map() | keyword(), keyword()) :: %{
          items: [Puzzle.t()],
          page: pos_integer(),
          page_size: pos_integer(),
          total_items: non_neg_integer(),
          total_pages: non_neg_integer()
        }
  def paginate_for_author(author_id, params \\ %{}, opts \\ []) do
    %{page: page, page_size: page_size} = normalize_pagination(params)

    viewer_id = Keyword.get(opts, :viewer_id)
    include_private = viewer_id == author_id || Keyword.get(opts, :include_private, false)

    filtered_query =
      base_query()
      |> where([p], p.author_id == ^author_id)
      |> maybe_filter_visibility(include_private)

    offset = (page - 1) * page_size

    items =
      filtered_query
      |> order_by([p], desc: p.inserted_at)
      |> limit(^page_size)
      |> offset(^offset)
      |> Repo.all()

    total_items =
      Puzzle
      |> where([p], p.author_id == ^author_id)
      |> maybe_filter_visibility(include_private)
      |> Repo.aggregate(:count, :id)

    total_pages =
      if total_items == 0 do
        0
      else
        total_items
        |> Kernel./(page_size)
        |> Float.ceil()
        |> trunc()
      end

    %{
      items: items,
      page: page,
      page_size: page_size,
      total_items: total_items,
      total_pages: total_pages
    }
  end

  @spec list_published(keyword()) :: [Puzzle.t()]
  def list_published(opts \\ []) do
    base_query()
    |> maybe_filter_visibility(false)
    |> maybe_filter_by_author(opts)
    |> maybe_filter_by_tags(opts)
    |> order_by([p], desc: p.inserted_at)
    |> Repo.all()
  end

  @doc """
  Lists public (approved) puzzles authored by the given user.
  """
  @spec list_author_public(Ecto.UUID.t()) :: [Puzzle.t()]
  def list_author_public(author_id) do
    base_query()
    |> where([p], p.author_id == ^author_id)
    |> maybe_filter_visibility(false)
    |> order_by([p], desc: p.inserted_at)
    |> Repo.all()
  end

  @doc """
  Lists every puzzle authored by the given user regardless of visibility.
  Intended for authenticated owners viewing their own content.
  """
  @spec list_author_all(Ecto.UUID.t()) :: [Puzzle.t()]
  def list_author_all(author_id) do
    base_query()
    |> where([p], p.author_id == ^author_id)
    |> order_by([p], desc: p.inserted_at)
    |> Repo.all()
  end

  @spec get_puzzle!(Ecto.UUID.t(), keyword()) :: Puzzle.t()
  def get_puzzle!(id, opts \\ []) do
    base_query()
    |> maybe_preload(opts)
    |> Repo.get!(id)
  end

  @spec get_puzzle(Ecto.UUID.t()) :: Puzzle.t() | nil
  def get_puzzle(id) do
    base_query()
    |> Repo.get(id)
  end

  @spec fetch_puzzle_with_validators(Ecto.UUID.t()) :: {:ok, Puzzle.t()} | {:error, :not_found}
  def fetch_puzzle_with_validators(id) do
    case get_puzzle(id) do
      nil -> {:error, :not_found}
      puzzle -> {:ok, puzzle}
    end
  end

  @doc """
  Fetches a puzzle by ID, returning {:ok, puzzle} or {:error, :not_found}.
  """
  @spec fetch_puzzle(Ecto.UUID.t()) :: {:ok, Puzzle.t()} | {:error, :not_found}
  def fetch_puzzle(id) do
    case get_puzzle(id) do
      nil -> {:error, :not_found}
      puzzle -> {:ok, puzzle}
    end
  end

  @spec create_puzzle(puzzle_params()) :: {:ok, Puzzle.t()} | {:error, Ecto.Changeset.t()}
  def create_puzzle(attrs) do
    Multi.new()
    |> Multi.insert(:puzzle, Puzzle.changeset(%Puzzle{}, attrs))
    |> Multi.run(:validators, fn repo, %{puzzle: puzzle} ->
      upsert_validators(repo, puzzle, Map.get(attrs, :validators, []))
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{puzzle: puzzle}} -> {:ok, preload_assocs(puzzle)}
      {:error, _step, changeset, _} -> {:error, changeset}
    end
  end

  @spec update_puzzle(Puzzle.t(), map()) :: {:ok, Puzzle.t()} | {:error, Ecto.Changeset.t()}
  def update_puzzle(%Puzzle{} = puzzle, attrs) do
    Multi.new()
    |> Multi.update(:puzzle, Puzzle.changeset(puzzle, attrs))
    |> Multi.run(:validators, fn repo, %{puzzle: puzzle} ->
      upsert_validators(repo, puzzle, Map.get(attrs, :validators, []))
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{puzzle: puzzle}} -> {:ok, preload_assocs(puzzle)}
      {:error, _step, changeset, _} -> {:error, changeset}
    end
  end

  @spec delete_puzzle(Puzzle.t()) :: {:ok, Puzzle.t()} | {:error, Ecto.Changeset.t()}
  def delete_puzzle(%Puzzle{} = puzzle) do
    Repo.delete(puzzle)
  end

  @spec attach_metrics(Puzzle.t(), map()) ::
          {:ok, PuzzleMetric.t()} | {:error, Ecto.Changeset.t()}
  def attach_metrics(%Puzzle{id: puzzle_id}, attrs) do
    %PuzzleMetric{puzzle_id: puzzle_id}
    |> PuzzleMetric.changeset(attrs)
    |> Repo.insert(
      on_conflict: {:replace_all_except, [:id, :inserted_at]},
      conflict_target: :puzzle_id
    )
  end

  defp upsert_validators(repo, puzzle, validators) when is_list(validators) do
    repo.delete_all(from v in PuzzleValidator, where: v.puzzle_id == ^puzzle.id)

    validators
    |> Enum.map(fn validator_attrs ->
      validator_attrs
      |> Map.put(:puzzle_id, puzzle.id)
      |> PuzzleValidator.changeset(%PuzzleValidator{})
    end)
    |> Enum.reduce_while({:ok, []}, fn
      %Ecto.Changeset{valid?: true} = changeset, {:ok, acc} ->
        case repo.insert(changeset) do
          {:ok, validator} -> {:cont, {:ok, [validator | acc]}}
          {:error, changeset} -> {:halt, {:error, changeset}}
        end

      changeset, _ ->
        {:halt, {:error, changeset}}
    end)
  end

  defp upsert_validators(_repo, _puzzle, _), do: {:ok, []}

  defp base_query do
    from p in Puzzle,
      preload: [:author, :validators, :metrics]
  end

  defp maybe_preload(query, opts) do
    case Keyword.get(opts, :preload) do
      nil -> query
      preload -> preload(query, ^preload)
    end
  end

  defp maybe_filter_by_author(query, opts) do
    case Keyword.get(opts, :author_id) do
      nil -> query
      author_id -> where(query, [p], p.author_id == ^author_id)
    end
  end

  defp maybe_filter_by_tags(query, opts) do
    case Keyword.get(opts, :tags) do
      nil -> query
      [] -> query
      tags -> where(query, [p], fragment("tags && ?", ^tags))
    end
  end

  defp maybe_filter_visibility(query, true), do: query

  defp maybe_filter_visibility(query, _include_private) do
    where(query, [p], fragment("lower(?) = ?", p.visibility, ^"approved"))
  end

  defp normalize_pagination(params) do
    page =
      params
      |> fetch_param(:page, @default_page)
      |> coerce_integer(@default_page)
      |> max(@min_page)

    page_size =
      params
      |> fetch_param(:page_size, @default_page_size)
      |> coerce_integer(@default_page_size)
      |> max(@min_page_size)
      |> min(@max_page_size)

    %{page: page, page_size: page_size}
  end

  defp fetch_param(params, key, default) when is_map(params) do
    Map.get(params, key, Map.get(params, to_string(key), default))
  end

  defp fetch_param(params, key, default) when is_list(params) do
    Keyword.get(params, key, default)
  end

  defp fetch_param(_params, _key, default), do: default

  defp coerce_integer(value, _default) when is_integer(value), do: value

  defp coerce_integer(value, default) when is_binary(value) do
    case Integer.parse(value) do
      {int, _rest} -> int
      :error -> default
    end
  end

  defp coerce_integer(_value, default), do: default

  defp preload_assocs(puzzle) do
    Repo.preload(puzzle, [:author, :validators, :metrics])
  end
end
