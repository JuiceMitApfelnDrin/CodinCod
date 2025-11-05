import { browser } from "$app/environment";
import { codincodApiWebProgrammingLanguageControllerIndex2 } from "@/api/generated/default/default";
import { localStorageKeys } from "@/config/local-storage";
import { logger } from "@/utils/debug-logger";
import { get, writable } from "svelte/store";
import { type ProgrammingLanguageDto } from "types";
import { isAuthenticated } from "./auth.store";

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
		if (!browser) {
			logger.store("Languages cache check skipped (not in browser)");
			return null;
		}

		try {
			const cached = localStorage.getItem(localStorageKeys.LANGUAGES);
			if (!cached) {
				logger.store("No cached languages found");
				return null;
			}

			const parsed: LanguagesCache = JSON.parse(cached);
			const now = Date.now();

			// Check if cache is still valid
			if (
				parsed.timestamp &&
				parsed.languages &&
				Array.isArray(parsed.languages)
			) {
				const age = now - parsed.timestamp;
				if (age < CACHE_DURATION_MS) {
					logger.store(
						`Using cached languages (${parsed.languages.length} items, age: ${Math.round(age / 1000)}s)`
					);
					return parsed.languages;
				} else {
					logger.store(
						`Cached languages expired (age: ${Math.round(age / 1000)}s > ${CACHE_DURATION_MS / 1000}s)`
					);
				}
			}
		} catch (error) {
			logger.error("Failed to parse cached languages", error);
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
			logger.store(`Cached ${languages.length} languages to localStorage`);
		} catch (error) {
			logger.error("Failed to save languages to cache", error);
		}
	};

	const fetchLanguages = async (): Promise<void> => {
		if (!browser) {
			logger.store("Languages fetch skipped (not in browser)");
			return;
		}

		// Check if user is authenticated before fetching
		const authenticated = get(isAuthenticated);
		if (!authenticated) {
			logger.store("Languages fetch skipped (user not authenticated)");
			return;
		}

		try {
			logger.store("Fetching languages from API...");
			const languagesArray =
				await codincodApiWebProgrammingLanguageControllerIndex2();

			logger.store("Raw languages response:", languagesArray);

			if (!Array.isArray(languagesArray) || languagesArray.length === 0) {
				logger.error("Languages array is empty or invalid:", languagesArray);
				throw new Error("Languages array is empty or invalid");
			}

			logger.store(`Successfully loaded ${languagesArray.length} languages`);
			set(languagesArray as ProgrammingLanguageDto[]);
			saveToCache(languagesArray as ProgrammingLanguageDto[]);
			retryCount = 0; // Reset retry count on success
		} catch (error) {
			logger.error("Failed to load languages", error);

			// Retry logic
			if (retryCount < MAX_RETRIES) {
				retryCount++;
				logger.store(
					`Retrying language fetch (${retryCount}/${MAX_RETRIES}) in ${RETRY_DELAY_MS}ms...`
				);

				retryTimeout = setTimeout(() => {
					fetchLanguages();
				}, RETRY_DELAY_MS);
			} else {
				logger.error("Max retries reached for loading languages");
				// Still keep cached data if available
			}
		}
	};

	return {
		async loadLanguages() {
			if (!browser) {
				logger.store("loadLanguages() skipped (not in browser)");
				return;
			}

			logger.store("loadLanguages() called");

			// Try to load from cache first
			const cached = getCachedLanguages();
			if (cached && cached.length > 0) {
				logger.store(`Setting ${cached.length} cached languages to store`);
				set(cached);
				// Refresh in background
				logger.store("Starting background refresh of languages");
				fetchLanguages().catch((error) => {
					logger.error("Background refresh of languages failed", error);
				});
				return;
			}

			// No valid cache, fetch from server
			logger.store("No valid cache, fetching languages from server");
			await fetchLanguages();
		},

		async refreshLanguages() {
			logger.store("refreshLanguages() called - forcing fresh fetch");
			await fetchLanguages();
		},

		clearRetryTimeout() {
			if (retryTimeout) {
				logger.store("Clearing languages retry timeout");
				clearTimeout(retryTimeout);
				retryTimeout = null;
			}
		},

		subscribe
	};
};

export const languages = createLanguagesStore();

// Auto-load languages when user logs in
if (browser) {
	isAuthenticated.subscribe((authenticated) => {
		if (authenticated) {
			logger.store("User authenticated - auto-loading languages");
			languages.loadLanguages();
		} else {
			logger.store("User not authenticated - skipping language load");
		}
	});
}
