import { z } from "zod";

export const paginatedQuerySchema = z.object({
	page: z.coerce.number().min(1).prefault(1),
	pageSize: z.coerce.number().min(1).max(100).prefault(10),
});

export type PaginatedQuery = z.infer<typeof paginatedQuerySchema>;
