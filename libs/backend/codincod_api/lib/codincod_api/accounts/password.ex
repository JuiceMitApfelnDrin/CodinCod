defmodule CodincodApi.Accounts.Password do
  @moduledoc """
  Centralised password hashing and verification utilities.

  Wraps the configured password adapter so we can mock or swap hashing
  algorithms without touching the rest of the codebase. Defaults to
  `Pbkdf2` for improved Windows compatibility while still allowing an
  optional legacy adapter (for example, `Bcrypt`) to be configured during
  the data migration window.
  """

  @type hash :: String.t()

  @spec hash(String.t()) :: {:ok, hash()} | {:error, String.t()}
  def hash(password) when is_binary(password) do
    adapter = adapter_module()

    with :ok <- ensure_adapter_loaded(adapter) do
      {:ok, adapter.hash_pwd_salt(password)}
    else
      {:error, reason} -> {:error, reason}
    end
  rescue
    error -> {:error, Exception.message(error)}
  end

  @spec verify?(String.t(), hash()) :: boolean()
  def verify?(password, hash) when is_binary(password) and is_binary(hash) do
    adapter = pick_adapter(hash)

    case ensure_adapter_loaded(adapter) do
      :ok -> adapter.verify_pass(password, hash)
      {:error, _} -> false
    end
  rescue
    _ -> false
  end

  @spec needs_rehash?(hash()) :: boolean()
  def needs_rehash?(hash) when is_binary(hash) do
    adapter = pick_adapter(hash)

    case ensure_adapter_loaded(adapter) do
      :ok -> adapter.needs_rehash?(hash)
      {:error, _} -> true
    end
  rescue
    _ -> true
  end

  defp ensure_adapter_loaded(nil) do
    {:error, "no password adapter configured"}
  end

  defp ensure_adapter_loaded(module) do
    if Code.ensure_loaded?(module) and
         function_exported?(module, :hash_pwd_salt, 1) and
         function_exported?(module, :verify_pass, 2) do
      :ok
    else
      {:error, "password adapter #{inspect(module)} is not available"}
    end
  end

  defp pick_adapter(hash) do
    cond do
      pbkdf2_hash?(hash) -> adapter_module()
      legacy_adapter = legacy_adapter_module() -> legacy_adapter
      true -> adapter_module()
    end
  end

  defp pbkdf2_hash?(hash), do: String.starts_with?(hash, "$pbkdf2-")

  defp adapter_module do
    Application.get_env(:codincod_api, :password_adapter, Pbkdf2)
  end

  defp legacy_adapter_module do
    Application.get_env(:codincod_api, :legacy_password_adapter)
  end
end
