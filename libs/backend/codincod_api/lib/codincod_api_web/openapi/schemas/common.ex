defmodule CodincodApiWeb.OpenAPI.Schemas.Common do
  @moduledoc """
  Shared schema utilities.
  """

  require OpenApiSpex

  defmodule ErrorResponse do
    @moduledoc false
    OpenApiSpex.schema(%{
      title: "ErrorResponse",
      type: :object,
      properties: %{
        message: %OpenApiSpex.Schema{type: :string},
        errors: %OpenApiSpex.Schema{type: :object},
        error: %OpenApiSpex.Schema{type: :string}
      }
    })
  end
end
