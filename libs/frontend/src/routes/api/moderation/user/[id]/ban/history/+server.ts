import { error, json } from "@sveltejs/kit";
import { apiUrls } from "@/config/api";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, cookies }) => {
	const sessionToken = cookies.get("sessionToken");
	const userId = params.id;

	if (!sessionToken) {
		throw error(401, "Unauthorized");
	}

	if (!userId) {
		throw error(400, "User ID is required");
	}

	try {
		const response = await fetch(
            apiUrls.moderationUserByIdBanHistory(userId),
			{
				method: "GET",
				headers: {
					Cookie: `sessionToken=${sessionToken}`
				}
			}
		);

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: "Failed to fetch ban history" }));
			throw error(response.status, errorData.message);
		}

		const result = await response.json();
		return json(result);
	} catch (err) {
		console.error("Error fetching ban history:", err);
		if (err instanceof Error && "status" in err) {
			throw err;
		}
		throw error(500, "Internal server error");
	}
};
