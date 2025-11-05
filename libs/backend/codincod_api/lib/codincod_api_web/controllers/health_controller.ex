defmodule CodincodApiWeb.HealthController do
  @moduledoc """
  Health check endpoint for monitoring service availability.
  """

  use CodincodApiWeb, :controller
  use OpenApiSpex.ControllerSpecs

  tags(["Health"])

  operation(:show,
    summary: "Health check",
    description: "Returns service health status",
    responses: %{
      200 => {
        "Health status",
        "application/json",
        %OpenApiSpex.Schema{
          type: :object,
          properties: %{
            status: %OpenApiSpex.Schema{type: :string, example: "OK"}
          }
        }
      }
    }
  )

  def show(conn, _params) do
    conn
    |> put_status(:ok)
    |> json(%{status: "OK"})
  end
end
