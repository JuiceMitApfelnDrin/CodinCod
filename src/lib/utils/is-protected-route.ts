import { unProtectedRoutes } from "@/config/unprotectedRoutes";
import type { ServerLoadEvent } from "@sveltejs/kit";
import { isFrontendUrl } from "types";

export function isProtectedRoute(event: ServerLoadEvent) {
	const frontendUrl = event.url.pathname;
	const isKnownFrontendUrl = isFrontendUrl(frontendUrl);
	const isUnprotectedRoute = isKnownFrontendUrl && unProtectedRoutes.includes(frontendUrl);
	const isProtectedRoute = !isUnprotectedRoute;

	return isProtectedRoute;
}
