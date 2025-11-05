defmodule CodincodApiWeb.Serializers.Helpers do
  @moduledoc false

  @spec format_datetime(DateTime.t() | NaiveDateTime.t() | nil | term()) :: String.t() | nil
  def format_datetime(nil), do: nil
  def format_datetime(%DateTime{} = datetime), do: DateTime.to_iso8601(datetime)
  def format_datetime(%NaiveDateTime{} = datetime), do: NaiveDateTime.to_iso8601(datetime)
  def format_datetime(_), do: nil

  @spec coalesce([term()], term()) :: term()
  def coalesce(values, default \\ nil)

  def coalesce([], default), do: default
  def coalesce([nil | rest], default), do: coalesce(rest, default)
  def coalesce([value | _], _default), do: value
end
