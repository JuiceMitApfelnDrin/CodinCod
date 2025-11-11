import { z } from "zod";
import { PAGINATION_CONFIG } from "../config/pagination.js";

export const paginatedQuerySchema = z.object({
	page: z.coerce
		.number()
		.min(PAGINATION_CONFIG.MIN_PAGE)
		.prefault(PAGINATION_CONFIG.DEFAULT_PAGE),
	pageSize: z.coerce
		.number()
		.min(PAGINATION_CONFIG.MIN_LIMIT)
		.max(PAGINATION_CONFIG.MAX_LIMIT)
		.prefault(PAGINATION_CONFIG.DEFAULT_LIMIT)
});

export type PaginatedQuery = z.infer<typeof paginatedQuerySchema>;
