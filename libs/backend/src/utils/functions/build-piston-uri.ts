export function buildPistonUri(url: string) {
	const pistonUrl = process.env.PISTON_URI;

	if (!pistonUrl) {
		throw new Error("Bruh, you forgot to add PISTON_URI to your .env");
	}

	return `${pistonUrl}${url}`;
}
