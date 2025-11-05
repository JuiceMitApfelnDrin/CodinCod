defmodule CodincodApi.Accounts.Email do
  @moduledoc """
  Constructs email messages for account actions like password resets.
  """

  import Swoosh.Email

  alias CodincodApi.Accounts.User

  @from_email Application.compile_env(:codincod_api, :from_email, "noreply@codincod.com")

  @doc """
  Builds password reset email with reset link.
  """
  @spec password_reset_email(User.t(), String.t()) :: Swoosh.Email.t()
  def password_reset_email(%User{email: email, username: username}, reset_url) do
    new()
    |> to({username, email})
    |> from({"CodinCod", @from_email})
    |> subject("Password Reset Request")
    |> html_body("""
    <h2>Password Reset</h2>
    <p>Hello #{username},</p>
    <p>You requested a password reset for your CodinCod account.</p>
    <p>Click the link below to reset your password:</p>
    <p><a href="#{reset_url}">Reset Password</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you did not request this reset, please ignore this email.</p>
    <p>Thanks,<br>The CodinCod Team</p>
    """)
    |> text_body("""
    Password Reset

    Hello #{username},

    You requested a password reset for your CodinCod account.

    Click the link below to reset your password:
    #{reset_url}

    This link will expire in 1 hour.

    If you did not request this reset, please ignore this email.

    Thanks,
    The CodinCod Team
    """)
  end
end
