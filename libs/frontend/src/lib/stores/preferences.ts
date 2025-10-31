import { browser } from "$app/environment";
import { buildBackendUrl } from "@/config/backend";
import { localStorageKeys } from "@/config/local-storage";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { writable } from "svelte/store";
import {
	backendUrls,
	editorPreferencesSchema,
	httpRequestMethod,
	httpResponseCodes,
	isPreferencesDto,
	isThemeOption,
	type PreferencesDto
} from "types";

const createPreferencesStore = () => {
	const { set, subscribe, update } = writable<PreferencesDto | null>(null);

	const url = buildBackendUrl(backendUrls.ACCOUNT_PREFERENCES);

	// Helper to safely parse localStorage data
	const parseStoredPreferences = (
		stored: string | null
	): PreferencesDto | null => {
		if (!stored) return null;

		try {
			const parsed = JSON.parse(stored);
			// Validate that it has the expected structure
			if (isPreferencesDto(parsed)) {
				return parsed as PreferencesDto;
			}
		} catch (error) {
			console.error("Failed to parse stored preferences:", error);
			// Clear invalid data
			localStorage.removeItem(localStorageKeys.PREFERENCES);
		}
		return null;
	};

	// Helper to safely save to localStorage
	const saveToLocalStorage = (preferences: PreferencesDto | null): void => {
		try {
			if (preferences) {
				localStorage.setItem(
					localStorageKeys.PREFERENCES,
					JSON.stringify(preferences)
				);
			} else {
				localStorage.removeItem(localStorageKeys.PREFERENCES);
			}
		} catch (error) {
			console.error("Failed to save preferences to localStorage:", error);
		}
	};

	return {
		async loadPreferences() {
			if (!browser) return;

			const storedPreferences = parseStoredPreferences(
				localStorage.getItem(localStorageKeys.PREFERENCES)
			);

			if (storedPreferences) {
				set(storedPreferences);
				// Refresh from server in background
				this.refreshPreferences().catch((error) => {
					console.warn("Failed to refresh preferences from server:", error);
				});
				return;
			}

			await this.refreshPreferences();
		},

		async refreshPreferences() {
			if (!browser) return;

			try {
				const response = await fetchWithAuthenticationCookie(url);

				if (!response.ok) {
					if (response.status === httpResponseCodes.CLIENT_ERROR.NOT_FOUND) {
						// No preferences found, create default
						const defaultPreferences: PreferencesDto = {
							editor: editorPreferencesSchema.parse({})
						};

						const theme = localStorage.getItem(localStorageKeys.THEME);
						if (isThemeOption(theme)) {
							defaultPreferences.theme = theme;
						}

						await this.updatePreferences(defaultPreferences);
						return;
					}

					throw new Error(
						`Failed to fetch preferences: ${response.status} ${response.statusText}`
					);
				}

				const data = await response.json();
				set(data);
				saveToLocalStorage(data);
			} catch (error) {
				console.error("Failed to load preferences:", error);
				// Keep existing state if refresh fails
			}
		},

		async resetPreferences() {
			if (!browser) return;

			try {
				const response = await fetchWithAuthenticationCookie(url, {
					method: httpRequestMethod.DELETE
				});

				if (!response.ok) {
					throw new Error(`Failed to reset preferences: ${response.status}`);
				}

				set(null);
				saveToLocalStorage(null);
			} catch (error) {
				console.error("Failed to reset preferences:", error);
				throw error; // Re-throw to let callers handle
			}
		},

		subscribe,

		async updatePreferences(updates: Partial<PreferencesDto>) {
			if (!browser) return;

			try {
				const response = await fetchWithAuthenticationCookie(url, {
					body: JSON.stringify(updates),
					method: httpRequestMethod.PUT
				});

				if (!response.ok) {
					throw new Error(`Failed to update preferences: ${response.status}`);
				}

				const updatedData = await response.json();

				// Use the server response as source of truth
				update((current) => {
					const merged = {
						...current,
						...updatedData,
						editor: {
							...(current?.editor ?? editorPreferencesSchema.parse({})),
							...(updatedData.editor ?? {})
						}
					};
					saveToLocalStorage(merged);
					return merged;
				});
			} catch (error) {
				console.error("Failed to update preferences:", error);
				throw error; // Re-throw to let callers handle
			}
		}
	};
};

export const preferences = createPreferencesStore();
