import { buildBackendUrl } from "@/config/backend";
import {
	fetchWithAuthenticationCookie,
	getCookieHeader
} from "@/features/authentication/utils/fetch-with-authentication-cookie";
import {
	backendUrls,
	httpRequestMethod,
	reviewItemTypeEnum,
	type ReviewItem
} from "types";
import type { PageServerLoadEvent } from "./$types";

interface PaginatedResponse {
	data: ReviewItem[];
	pagination: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export async function load({ request, url }: PageServerLoadEvent) {
	// Get query parameters
	const type =
		url.searchParams.get("type") || reviewItemTypeEnum.PENDING_PUZZLE;
	const page = url.searchParams.get("page") || "1";
	const limit = url.searchParams.get("limit") || "20";

	// Fetch review items from backend
	const reviewUrl = `${buildBackendUrl(backendUrls.MODERATION_REVIEW)}?type=${type}&page=${page}&limit=${limit}`;

	try {
		const response = await fetchWithAuthenticationCookie(reviewUrl, {
			headers: getCookieHeader(request),
			method: httpRequestMethod.GET
		});

		if (!response.ok) {
			return {
				reviewItems: {
					data: [],
					pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
				} as PaginatedResponse,
				currentType: type,
				error: "Failed to fetch review items"
			};
		}

		const reviewItems: PaginatedResponse = await response.json();

		return {
			reviewItems,
			currentType: type
		};
	} catch (error) {
		console.error("Error fetching review items:", error);
		return {
			reviewItems: {
				data: [],
				pagination: { page: 1, limit: 20, total: 0, totalPages: 0 }
			} as PaginatedResponse,
			currentType: type,
			error: "Failed to fetch review items"
		};
	}
}
