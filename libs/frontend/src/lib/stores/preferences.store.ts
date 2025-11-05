import { browser } from "$app/environment";
import {
	codincodApiWebAccountPreferenceControllerDelete,
	codincodApiWebAccountPreferenceControllerReplace,
	codincodApiWebAccountPreferenceControllerShow
} from "@/api/generated/account-preferences/account-preferences";
import { localStorageKeys } from "@/config/local-storage";
import { derived, writable } from "svelte/store";
import {
	editorPreferencesSchema,
	isPreferencesDto,
	isThemeOption,
	type PreferencesDto,
	type UpdatePreferencesRequest
} from "types";
import { isAuthenticated } from "./auth.store";
import { theme } from "./theme.store";

const createPreferencesStore = () => {
	const { set, subscribe, update } = writable<PreferencesDto | null>(null);

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
				const data = await codincodApiWebAccountPreferenceControllerShow();

				set(data as PreferencesDto);
				saveToLocalStorage(data as PreferencesDto);
			} catch (error: unknown) {
				// Handle 404 - create default preferences
				const is404 =
					error instanceof Error && error.message?.includes?.("404");
				if (is404) {
					// Use Dto type which doesn't require owner (server will set it from auth)
					const defaultPreferences: PreferencesDto = {
						editor: editorPreferencesSchema.parse({})
					};

					const theme = localStorage.getItem(localStorageKeys.THEME);
					if (isThemeOption(theme)) {
						defaultPreferences.theme = theme;
					}

					// Update will create preferences on the server
					await this.updatePreferences(defaultPreferences);
					return;
				}

				console.error("Failed to load preferences:", error);
				// Keep existing state if refresh fails
			}
		},

		async resetPreferences() {
			if (!browser) return;

			try {
				await codincodApiWebAccountPreferenceControllerDelete();

				set(null);
				saveToLocalStorage(null);
			} catch (error) {
				console.error("Failed to reset preferences:", error);
				throw error; // Re-throw to let callers handle
			}
		},

		subscribe,

		async updatePreferences(updates: UpdatePreferencesRequest) {
			if (!browser) return;

			try {
				// Clean up undefined values to satisfy exactOptionalPropertyTypes
				const cleanUpdates = Object.fromEntries(
					Object.entries(updates).filter(([_, value]) => value !== undefined)
				);

				const updatedData =
					await codincodApiWebAccountPreferenceControllerReplace(cleanUpdates);

				// Use the server response as source of truth
				update((current) => {
					const merged = {
						...current,
						...updatedData,
						editor: {
							...(current?.editor ?? editorPreferencesSchema.parse({})),
							...(updatedData.editor ?? {})
						}
					} as PreferencesDto;
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

/**
 * start integrate preferences store
 */

if (browser) {
	isAuthenticated.subscribe((isAuthenticated) => {
		if (isAuthenticated) {
			preferences.loadPreferences();
		}
	});

	preferences.subscribe((newPreferences) => {
		if (newPreferences) {
			localStorage.setItem(
				localStorageKeys.PREFERENCES,
				JSON.stringify(newPreferences)
			);
		}

		if (newPreferences?.theme) {
			theme.set(newPreferences.theme);
		}
	});

	derived([theme, isAuthenticated], ([theme, isAuthenticated]) => {
		return { isAuthenticated, theme };
	}).subscribe(({ isAuthenticated, theme }) => {
		if (isAuthenticated) {
			preferences.updatePreferences({ theme });
		}
	});
}

/**
 * end integrate preferences store
 */
