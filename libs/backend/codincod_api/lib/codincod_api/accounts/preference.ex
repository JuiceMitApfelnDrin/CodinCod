defmodule CodincodApi.Accounts.Preference do
  @moduledoc """
  User preferences including editor configuration and personalization.
  """

  use Ecto.Schema
  import Ecto.Changeset

  alias CodincodApi.Accounts.User

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  @theme_options ["dark", "light"]

  schema "user_preferences" do
    field :legacy_id, :string
    field :preferred_language, :string
    field :theme, :string
    field :blocked_user_ids, {:array, :binary_id}, default: []
    field :editor, :map, default: %{}

    belongs_to :user, User

    timestamps(type: :utc_datetime_usec)
  end

  @typedoc "Persistent preferences associated with a user."
  @type t :: %__MODULE__{
          id: Ecto.UUID.t() | nil,
          legacy_id: String.t() | nil,
          preferred_language: String.t() | nil,
          theme: String.t() | nil,
          blocked_user_ids: [Ecto.UUID.t()],
          editor: map(),
          user_id: Ecto.UUID.t() | nil,
          inserted_at: DateTime.t() | nil,
          updated_at: DateTime.t() | nil
        }

  @spec changeset(t(), map()) :: Ecto.Changeset.t()
  def changeset(preference, attrs) do
    preference
    |> cast(attrs, [
      :legacy_id,
      :preferred_language,
      :theme,
      :blocked_user_ids,
      :editor,
      :user_id
    ])
    |> validate_required([:user_id])
    |> unique_constraint(:user_id)
    |> validate_change(:theme, &validate_theme/2)
    |> normalize_editor()
  end

  @doc "Available theme options mirrored from the frontend."
  @spec theme_options() :: [String.t()]
  def theme_options, do: @theme_options

  defp normalize_editor(changeset) do
    update_change(changeset, :editor, fn
      nil -> %{}
      editor when is_map(editor) -> editor
      _ -> %{}
    end)
  end

  defp validate_theme(:theme, nil), do: []
  defp validate_theme(:theme, value) when value in @theme_options, do: []

  defp validate_theme(:theme, _value) do
    [theme: "must be one of #{Enum.join(@theme_options, ", ")} or null"]
  end

  defp validate_theme(_field, _value), do: []
end
