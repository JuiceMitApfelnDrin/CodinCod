import { buildBackendUrl } from "@/config/backend";
import { debounce } from "@/utils/debounce";
import { backendUrls } from "types";

const cache: Record<string, boolean> = {};

export const usernameIsAvailable = debounce(async (username: string): Promise<boolean> => {
	if (username in cache) {
		return cache[username];
	}

	const response = await fetch(
		buildBackendUrl(backendUrls.USER_BY_USERNAME_IS_AVAILABLE, { username })
	);
	const result = await response.json();

	const isAvailable = result.isAvailable;
	cache[username] = isAvailable;

	return isAvailable;
}, 250);
