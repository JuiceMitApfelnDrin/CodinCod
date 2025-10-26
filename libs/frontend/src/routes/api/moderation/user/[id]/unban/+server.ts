import { env } from "$env/dynamic/private";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { apiUrls } from "@/config/api";

export const POST: RequestHandler = async ({ request, params, cookies }) => {
	const sessionToken = cookies.get("sessionToken");
	const userId = params.id;

	if (!sessionToken) {
		throw error(401, "Unauthorized");
	}

	if (!userId) {
		throw error(400, "User ID is required");
	}

	const body = await request.json();
	const { reason } = body;

	try {
		const response = await fetch(
            apiUrls.moderationUserByIdUnban(userId),
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Cookie: `sessionToken=${sessionToken}`
				},
				body: JSON.stringify({ reason })
			}
		);

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: "Failed to unban user" }));
			throw error(response.status, errorData.message);
		}

		const result = await response.json();
		return json(result);
	} catch (err) {
		console.error("Error unbanning user:", err);
		if (err instanceof Error && "status" in err) {
			throw err;
		}
		throw error(500, "Internal server error");
	}
};
