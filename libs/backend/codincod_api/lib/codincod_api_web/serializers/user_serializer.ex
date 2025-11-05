defmodule CodincodApiWeb.Serializers.UserSerializer do
  @moduledoc """
  Serializes `CodincodApi.Accounts.User` structs into API responses consistent with the
  legacy Node implementation.
  """

  alias CodincodApi.Accounts.User
  alias CodincodApiWeb.Serializers.Helpers

  @spec render(User.t() | nil) :: map() | nil
  def render(%User{} = user) do
    %{
      _id: user.id,
      id: user.id,
      legacyId: user.legacy_id,
      legacyUsername: user.legacy_username,
      username: user.username,
      profile: user.profile || %{},
      role: user.role,
      reportCount: user.report_count,
      banCount: user.ban_count,
      currentBan: user.current_ban_id,
      createdAt: Helpers.format_datetime(user.inserted_at),
      updatedAt: Helpers.format_datetime(user.updated_at)
    }
  end

  def render(_), do: nil
end
