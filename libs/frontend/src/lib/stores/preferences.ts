import { browser } from "$app/environment";
import { apiUrls, buildApiUrl } from "@/config/api";
import { localStorageKeys } from "@/config/local-storage";
import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
import { writable } from "svelte/store";
import { httpRequestMethod, httpResponseCodes, isThemeOption, type PreferencesDto } from "types";

const createPreferencesStore = () => {
	const { set, subscribe, update } = writable<PreferencesDto | null>(null);

	const url = buildApiUrl(apiUrls.ACCOUNT_PREFERENCES);

	return {
		async loadPreferences() {
			if (!browser) return;

			try {
				const response = await fetchWithAuthenticationCookie(url);
				const data = await response.json();

				if (!response.ok && response.status === httpResponseCodes.CLIENT_ERROR.NOT_FOUND) {
					const defaultPreferences: PreferencesDto = {};

					const theme = localStorage.getItem(localStorageKeys.THEME);

					if (isThemeOption(theme)) {
						defaultPreferences.theme = theme;
					}

					await this.updatePreferences(defaultPreferences);
					return;
				}

				set(data);
			} catch (error) {
				console.error("Failed to load preferences:", error);
			}
		},
		async resetPreferences() {
			if (!browser) return;

			try {
				await fetchWithAuthenticationCookie(url, {
					method: httpRequestMethod.DELETE
				}).then(() => set(null));
			} catch (error) {
				console.error("Failed to reset preferences:", error);
			}
		},
		subscribe,
		async updatePreferences(updates: Partial<PreferencesDto>) {
			if (!browser) return;

			try {
				await fetchWithAuthenticationCookie(url, {
					body: JSON.stringify(updates),
					method: httpRequestMethod.PUT
				}).then((res) => res.json());

				update((current) => ({ ...current, ...updates }));
			} catch (error) {
				console.error("Failed to update preferences:", error);
			}
		}
	};
};

export const preferences = createPreferencesStore();
