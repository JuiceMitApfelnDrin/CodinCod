defmodule CodincodApiWeb.Auth.Guardian do
  @moduledoc """
  Guardian implementation for JWT authentication.
  Handles encoding/decoding of tokens and user resource management.
  """
  use Guardian, otp_app: :codincod_api

  alias CodincodApi.Accounts
  alias CodincodApi.Accounts.User

  @doc """
  Encodes the user ID as the subject claim.
  """
  def subject_for_token(%User{id: id}, _claims) do
    {:ok, to_string(id)}
  end

  def subject_for_token(_, _) do
    {:error, :invalid_resource}
  end

  @doc """
  Retrieves the user from the subject claim.
  """
  def resource_from_claims(%{"sub" => id}) do
    case Accounts.get_user(id) do
      nil -> {:error, :user_not_found}
      user -> {:ok, user}
    end
  end

  def resource_from_claims(_claims) do
    {:error, :invalid_claims}
  end

  @doc """
  Generates a JWT token for a user with custom claims.
  """
  def generate_token(user, token_type \\ :access) do
    claims = %{
      "typ" => Atom.to_string(token_type),
      "username" => user.username,
      "role" => user.role
    }

    encode_and_sign(user, claims, ttl: get_ttl(token_type))
  end

  defp get_ttl(:access), do: {7, :days}
  defp get_ttl(:refresh), do: {30, :days}
  defp get_ttl(:password_reset), do: {1, :hour}
  defp get_ttl(:email_confirmation), do: {24, :hours}
end
