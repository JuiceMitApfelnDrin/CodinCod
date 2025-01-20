export const pistonBaseRoute = "/api/v2";

export const pistonUrls = {
	RUNTIME: `${pistonBaseRoute}/runtimes`,
	EXECUTE: `${pistonBaseRoute}/execute`
} as const;
