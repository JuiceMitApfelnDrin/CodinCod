defmodule CodincodApiWeb.OpenAPI.Schemas.Account do
  @moduledoc """
  Account related schema definitions.
  """

  require OpenApiSpex
  alias CodincodApiWeb.OpenAPI.Schemas.User

  defmodule StatusResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "AccountStatusResponse",
      type: :object,
      required: [:isAuthenticated],
      properties: %{
        isAuthenticated: %OpenApiSpex.Schema{type: :boolean},
        userId: %OpenApiSpex.Schema{type: :string, format: :uuid},
        username: %OpenApiSpex.Schema{type: :string},
        role: %OpenApiSpex.Schema{type: :string}
      }
    })
  end

  defmodule ProfileUpdateRequest do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "ProfileUpdateRequest",
      type: :object,
      properties: %{
        bio: %OpenApiSpex.Schema{type: :string, maxLength: 500},
        location: %OpenApiSpex.Schema{type: :string, maxLength: 100},
        picture: %OpenApiSpex.Schema{type: :string, format: :uri},
        socials: %OpenApiSpex.Schema{
          type: :array,
          items: %OpenApiSpex.Schema{type: :string, format: :uri},
          maxItems: 5
        }
      }
    })
  end

  defmodule PreferencesPayload do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "PreferencesPayload",
      type: :object,
      properties: %{
        preferredLanguage: %OpenApiSpex.Schema{type: :string, nullable: true},
        theme: %OpenApiSpex.Schema{
          type: :string,
          enum: CodincodApi.Accounts.Preference.theme_options(),
          nullable: true
        },
        blockedUsers: %OpenApiSpex.Schema{
          type: :array,
          items: %OpenApiSpex.Schema{type: :string, format: :uuid}
        },
        editor: %OpenApiSpex.Schema{type: :object}
      }
    })
  end

  defmodule ProfileUpdateResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "ProfileUpdateResponse",
      type: :object,
      properties: %{
        message: %OpenApiSpex.Schema{type: :string},
        profile: User.Profile.schema()
      }
    })
  end
end
