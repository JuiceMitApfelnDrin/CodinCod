defmodule CodincodApiWeb.OpenAPI.Schemas.PasswordReset do
  @moduledoc """
  Password reset API schemas.
  """

  require OpenApiSpex

  defmodule RequestPayload do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      required: ["email"],
      properties: %{
        email: %OpenApiSpex.Schema{type: :string, format: :email}
      }
    })
  end

  defmodule RequestResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        message: %OpenApiSpex.Schema{type: :string}
      }
    })
  end

  defmodule ResetPayload do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      required: ["token", "password"],
      properties: %{
        token: %OpenApiSpex.Schema{type: :string},
        password: %OpenApiSpex.Schema{type: :string, minLength: 8}
      }
    })
  end

  defmodule ResetResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      type: :object,
      properties: %{
        message: %OpenApiSpex.Schema{type: :string}
      }
    })
  end
end
