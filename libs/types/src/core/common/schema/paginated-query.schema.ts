import { z } from "zod";

const numericString = z
	.string()
	.regex(/^\d+$/, "Must be a numeric string")
	.transform(Number)
	.pipe(z.number());

const positiveNumberSchema = z.union([z.number(), numericString]).transform(Number);

export const paginatedQuerySchema = z.object({
	page: positiveNumberSchema.pipe(z.number().min(1)).default(1),
	pageSize: positiveNumberSchema.pipe(z.number().min(1).max(100)).default(10)
});

export type PaginatedQuery = z.infer<typeof paginatedQuerySchema>;
