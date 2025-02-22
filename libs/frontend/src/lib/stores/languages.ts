import { browser } from "$app/environment";
import { fetchSupportedLanguages } from "@/utils/fetch-supported-languages";
import { writable } from "svelte/store";

const createLanguagesStore = () => {
	const { set, subscribe } = writable<string[] | null>(null);

	return {
		async loadLanguages() {
			if (!browser) return;

			try {
				const languages = await fetchSupportedLanguages();

				set(languages);
			} catch (error) {
				console.error("Failed to load languages:", error);
			}
		},

		subscribe
	};
};

export const languages = createLanguagesStore();
languages.loadLanguages();
