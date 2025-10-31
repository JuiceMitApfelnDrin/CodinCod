import { ERROR_MESSAGES } from "types";

export function buildPistonUri(url: string) {
	const pistonUrl = process.env.PISTON_URI;

	if (!pistonUrl) {
		throw new Error(`${ERROR_MESSAGES.SERVER.INTERNAL_ERROR}: PISTON_URI environment variable is not set`);
	}

	return `${pistonUrl}${url}`;
}
