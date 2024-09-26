export async function fetchWithAuthenticationCookie(
	url: string | URL | globalThis.Request,
	options: RequestInit = {}
) {
	options.credentials = "include"; // Ensure cookies are included
	return await fetch(url, options);
}
