import { httpRequestMethod } from "types";

export const defaultFetchOptions = {
	headers: {
		"Content-Type": "application/json"
	},
	method: httpRequestMethod.GET
} as const;
