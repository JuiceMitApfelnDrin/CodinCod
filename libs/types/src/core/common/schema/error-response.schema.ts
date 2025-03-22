import { z } from "zod";

export const errorResponseSchema = z.object({
	message: z.string(),
	error: z.string(),
	details: z.string().optional()
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
