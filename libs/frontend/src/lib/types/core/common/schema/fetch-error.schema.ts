import { z } from "zod";

const aggregateErrorSchema = z.object({
	code: z.string().optional(),
	errors: z.array(z.instanceof(Error)),
});

export const fetchErrorSchema = z.object({
	name: z.string().optional(),
	message: z.string(),
	cause: aggregateErrorSchema.optional(),
});

export type FetchError = z.infer<typeof fetchErrorSchema>;

export function isFetchError(error: unknown): error is FetchError {
	return fetchErrorSchema.safeParse(error).success;
}
