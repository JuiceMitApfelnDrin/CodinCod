import { apiUrls, buildApiUrl } from "@/config/api";
import { httpRequestMethod, type PuzzleLanguage } from "types";

export async function fetchSupportedLanguages() {
	const response = await fetch(buildApiUrl(apiUrls.SUPPORTED_LANGUAGES), {
		method: httpRequestMethod.GET
	});

	const { languages }: { languages: PuzzleLanguage[] } = await response.json();
	return languages.sort();
}
