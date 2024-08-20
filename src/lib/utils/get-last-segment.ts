export function getLastSegment(url: string) {
	const segments = url.split("/");

	return segments[segments.length - 1];
}
