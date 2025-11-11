// Temporary backend URL builder - TODO: Remove after full migration to generated API
// This is here only to unblock type checking. The play-puzzle component needs refactoring.

export function buildBackendUrl(path: string): string {
	const baseUrl = import.meta.env.PUBLIC_BACKEND_URL || "http://localhost:4000";
	return `${baseUrl}${path}`;
}
