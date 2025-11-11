import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
import { redirect } from "@sveltejs/kit";

export function logout() {
	// Just redirect to the logout page, which will handle the backend API call
	throw redirect(303, frontendUrls.LOGOUT);
}
