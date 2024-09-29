import { getUserActivityByUsername } from "@/api/get-user-activity-by-username.js";

export async function load({ params }) {
	const username = params.username;

	const response = await getUserActivityByUsername(username);
	if (!response.ok) {
		console.error(response);
	}

	const userActivity = await response.json();

	return { userActivity };
}
