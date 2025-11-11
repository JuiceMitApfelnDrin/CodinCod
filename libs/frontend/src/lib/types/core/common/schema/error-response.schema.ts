import { z } from "zod";

export const errorResponseSchema = z.object({
	message: z.string(),
	error: z.string(),
	details: z.array(z.any()).optional() // Validation error details
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;
