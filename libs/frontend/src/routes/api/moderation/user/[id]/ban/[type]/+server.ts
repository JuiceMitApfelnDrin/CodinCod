import { env } from "$env/dynamic/private";
import { error, json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { backendUrls, httpRequestMethod, isBanType } from "types";

export const POST: RequestHandler = async ({ request, params, cookies }) => {
	const sessionToken = cookies.get("sessionToken");
	const userId = params.id;
	const type = params.type;

	if (!sessionToken) {
		throw error(401, "Unauthorized");
	}

	if (!userId) {
		throw error(400, "User ID is required");
	}

	if (!isBanType(type)) {
		throw error(400, "Invalid ban type");
	}

	const body = await request.json();
	const { duration, reason } = body;

	try {
		const response = await fetch(
			backendUrls.moderationUserByIdBanByType(userId, type),
			{
				method: httpRequestMethod.POST,
				headers: {
					"Content-Type": "application/json",
					Cookie: `sessionToken=${sessionToken}`
				},
				body: JSON.stringify({ duration, reason })
			}
		);

		if (!response.ok) {
			const errorData = await response
				.json()
				.catch(() => ({ message: "Failed to ban user" }));
			throw error(response.status, errorData.message);
		}

		const result = await response.json();
		return json(result);
	} catch (err) {
		console.error("Error banning user:", err);
		if (err instanceof Error && "status" in err) {
			throw err;
		}
		throw error(500, "Internal server error");
	}
};
