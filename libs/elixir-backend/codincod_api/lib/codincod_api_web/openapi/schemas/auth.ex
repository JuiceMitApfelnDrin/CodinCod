defmodule CodincodApiWeb.OpenAPI.Schemas.Auth do
  @moduledoc """
  Auth related OpenAPI schemas.
  """

  require OpenApiSpex

  defmodule LoginRequest do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "LoginRequest",
      type: :object,
      required: [:identifier, :password],
      properties: %{
        identifier: %OpenApiSpex.Schema{type: :string, description: "Username or email"},
        password: %OpenApiSpex.Schema{type: :string, format: :password}
      }
    })
  end

  defmodule RegisterRequest do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "RegisterRequest",
      type: :object,
      required: [:username, :email, :password],
      properties: %{
        username: %OpenApiSpex.Schema{type: :string, minLength: 3, maxLength: 20},
        email: %OpenApiSpex.Schema{type: :string, format: :email},
        password: %OpenApiSpex.Schema{type: :string, format: :password, minLength: 14},
        passwordConfirmation: %OpenApiSpex.Schema{type: :string, format: :password}
      }
    })
  end

  defmodule MessageResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "MessageResponse",
      type: :object,
      properties: %{
        message: %OpenApiSpex.Schema{type: :string}
      }
    })
  end
end
