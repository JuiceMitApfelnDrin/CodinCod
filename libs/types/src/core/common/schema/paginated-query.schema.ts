import { z } from "zod";

export const paginatedQuerySchema = z.object({
	page: z.number().min(1).default(1),
	pageSize: z.number().min(1).max(100).default(10)
});
export type PaginatedQuery = z.infer<typeof paginatedQuerySchema>;
