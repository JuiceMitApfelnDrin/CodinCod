import { loadWithFallback } from "$lib/api/error-handler";
import { codincodApiWebModerationControllerListReviews } from "$lib/api/generated/moderation/moderation";
import { PAGINATION_CONFIG } from "types";
import type { PageServerLoadEvent } from "./$types";

export async function load({ fetch, url }: PageServerLoadEvent) {
	// Get query parameters
	const type = url.searchParams.get("type");
	const page =
		url.searchParams.get("page") || String(PAGINATION_CONFIG.DEFAULT_PAGE);
	const limit =
		url.searchParams.get("limit") || String(PAGINATION_CONFIG.DEFAULT_LIMIT);

	// Fetch review items from backend using Orval-generated function
	const reviewItems = await loadWithFallback(
		() =>
			codincodApiWebModerationControllerListReviews({
				status: type as "pending" | "approved" | "rejected"
			}),
		{
			reviews: [],
			count: 0
		}
	);

	return {
		reviewItems,
		currentType: type
	};
}
