import { browser } from "$app/environment";
import { apiUrls } from "@/config/api";
import { writable } from "svelte/store";
import { httpRequestMethod } from "types";

const createLanguagesStore = () => {
	const { set, subscribe } = writable<string[] | null>(null);

	return {
		async loadLanguages() {
			if (!browser) return;

			try {
				const response = await fetch(apiUrls.SUPPORTED_LANGUAGES, {
					method: httpRequestMethod.GET
				});

				const { languages } = await response.json();

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
