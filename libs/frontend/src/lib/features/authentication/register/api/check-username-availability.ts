import { buildBackendUrl } from "@/config/backend";
import { debounce } from "@/utils/debounce";
import { backendUrls } from "types";

const cache: Record<string, boolean> = {};

export const checkUsernameAvailability = debounce(async (username: string): Promise<boolean> => {
	if (username in cache) {
		return cache[username];
	}

	const response = await fetch(buildBackendUrl(backendUrls.CHECK_USERNAME, { username }));
	const result = await response.json();

	const isAvailable = result.isAvailable;
	cache[username] = isAvailable;

	return isAvailable;
}, 250);
