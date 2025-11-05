defmodule CodincodApiWeb.Auth.Pipeline do
  @moduledoc """
  Guardian authentication pipeline for protected routes.
  """
  use Guardian.Plug.Pipeline,
    otp_app: :codincod_api,
    module: CodincodApiWeb.Auth.Guardian,
    error_handler: CodincodApiWeb.Auth.ErrorHandler

  plug Guardian.Plug.VerifyHeader, scheme: "Bearer"
  plug Guardian.Plug.EnsureAuthenticated
  plug Guardian.Plug.LoadResource
end
