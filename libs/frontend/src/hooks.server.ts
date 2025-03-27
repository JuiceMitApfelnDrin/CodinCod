import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);

	response.headers.set("Content-Type", "text/html; charset=UTF-8");

	return response;
};
