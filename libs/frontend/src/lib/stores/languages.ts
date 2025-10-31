import { browser } from "$app/environment";
import { localStorageKeys } from "@/config/local-storage";
import { buildBackendUrl } from "@/config/backend";
import { writable } from "svelte/store";
import {
	backendUrls,
	httpRequestMethod,
	type ProgrammingLanguageDto
} from "types";

const CACHE_DURATION_MS = 1000 * 60 * 60; // 1 hour
const RETRY_DELAY_MS = 5000; // 5 seconds
const MAX_RETRIES = 3;

interface LanguagesCache {
	languages: ProgrammingLanguageDto[];
	timestamp: number;
}

const createLanguagesStore = () => {
	const { set, subscribe } = writable<ProgrammingLanguageDto[]>([]);
	let retryCount = 0;
	let retryTimeout: ReturnType<typeof setTimeout> | null = null;

	// Helper to safely parse cached data
	const getCachedLanguages = (): ProgrammingLanguageDto[] | null => {
		if (!browser) return null;

		try {
			const cached = localStorage.getItem(localStorageKeys.LANGUAGES);
			if (!cached) return null;

			const parsed: LanguagesCache = JSON.parse(cached);
			const now = Date.now();

			// Check if cache is still valid
			if (
				parsed.timestamp &&
				parsed.languages &&
				Array.isArray(parsed.languages)
			) {
				if (now - parsed.timestamp < CACHE_DURATION_MS) {
					return parsed.languages;
				}
			}
		} catch (error) {
			console.error("Failed to parse cached languages:", error);
			// Clear invalid cache
			localStorage.removeItem(localStorageKeys.LANGUAGES);
		}
		return null;
	};

	// Helper to save to cache
	const saveToCache = (languages: ProgrammingLanguageDto[]): void => {
		if (!browser) return;

		try {
			const cache: LanguagesCache = {
				languages,
				timestamp: Date.now()
			};
			localStorage.setItem(localStorageKeys.LANGUAGES, JSON.stringify(cache));
		} catch (error) {
			console.error("Failed to save languages to cache:", error);
		}
	};

	const fetchLanguages = async (): Promise<void> => {
		if (!browser) return;

		try {
			const response = await fetch(
				buildBackendUrl(backendUrls.PROGRAMMING_LANGUAGE),
				{
					method: httpRequestMethod.GET,
					headers: {
						"Content-Type": "application/json"
					}
				}
			);

			if (!response.ok) {
				throw new Error(
					`Failed to fetch languages: ${response.status} ${response.statusText}`
				);
			}

			const data = await response.json();

			if (!data.languages || !Array.isArray(data.languages)) {
				throw new Error("Invalid response format: expected { languages: [] }");
			}

			set(data.languages);
			saveToCache(data.languages);
			retryCount = 0; // Reset retry count on success
		} catch (error) {
			console.error("Failed to load languages:", error);

			// Retry logic
			if (retryCount < MAX_RETRIES) {
				retryCount++;
				console.log(
					`Retrying language fetch (${retryCount}/${MAX_RETRIES}) in ${RETRY_DELAY_MS}ms...`
				);

				retryTimeout = setTimeout(() => {
					fetchLanguages();
				}, RETRY_DELAY_MS);
			} else {
				console.error("Max retries reached for loading languages");
				// Still keep cached data if available
			}
		}
	};

	return {
		async loadLanguages() {
			if (!browser) return;

			// Try to load from cache first
			const cached = getCachedLanguages();
			if (cached && cached.length > 0) {
				set(cached);
				// Refresh in background
				fetchLanguages().catch((error) => {
					console.warn("Background refresh of languages failed:", error);
				});
				return;
			}

			// No valid cache, fetch from server
			await fetchLanguages();
		},

		async refreshLanguages() {
			await fetchLanguages();
		},

		clearRetryTimeout() {
			if (retryTimeout) {
				clearTimeout(retryTimeout);
				retryTimeout = null;
			}
		},

		subscribe
	};
};

export const languages = createLanguagesStore();

// Auto-load languages on initialization
if (browser) {
	languages.loadLanguages();
}
