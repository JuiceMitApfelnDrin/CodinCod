import { httpRequestMethod } from "$lib/types/utils/constants/http-methods.js";

export const defaultFetchOptions = {
	headers: {
		"Content-Type": "application/json"
	},
	method: httpRequestMethod.GET
} as const;
