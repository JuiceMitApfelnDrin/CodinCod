defmodule CodincodApiWeb.ProgrammingLanguageController do
  @moduledoc """
  Controller for programming language endpoints.
  """

  use CodincodApiWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias CodincodApi.Languages

  action_fallback CodincodApiWeb.FallbackController

  @doc """
  List all available programming languages.
  """
  operation(:index,
    summary: "List all programming languages",
    responses: %{
      200 => {
        "Programming languages list",
        "application/json",
        %OpenApiSpex.Schema{
          type: :array,
          items: %OpenApiSpex.Schema{
            type: :object,
            properties: %{
              id: %OpenApiSpex.Schema{type: :string, format: :uuid},
              language: %OpenApiSpex.Schema{type: :string},
              version: %OpenApiSpex.Schema{type: :string},
              isActive: %OpenApiSpex.Schema{type: :boolean},
              runtime: %OpenApiSpex.Schema{type: :string},
              aliases: %OpenApiSpex.Schema{type: :array, items: %OpenApiSpex.Schema{type: :string}}
            }
          }
        }
      }
    }
  )

  def index(conn, _params) do
    languages = Languages.list_languages()

    # Serialize languages
    serialized_languages = Enum.map(languages, fn language ->
      %{
        id: language.id,
        language: language.language,
        version: language.version,
        isActive: language.is_active,
        runtime: language.runtime,
        aliases: language.aliases || []
      }
    end)

    json(conn, serialized_languages)
  end
end
