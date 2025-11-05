import { redirect } from "@sveltejs/kit";
import { frontendUrls } from "$lib/types";

export function logout() {
	// Just redirect to the logout page, which will handle the backend API call
	throw redirect(303, frontendUrls.LOGOUT);
}
