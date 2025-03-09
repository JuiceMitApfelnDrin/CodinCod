import { z } from "zod";
import { pistonExecutionResponseSuccessSchema } from "./execution-success.js";
import { pistonExecutionResponseErrorSchema } from "./execution-error.js";

export const pistonExecutionResponseSchema = pistonExecutionResponseSuccessSchema.or(
	pistonExecutionResponseErrorSchema
);
export type PistonExecutionResponse = z.infer<typeof pistonExecutionResponseSchema>;

export function isPistonExecutionResponse(data: unknown): data is PistonExecutionResponse {
	return pistonExecutionResponseSchema.safeParse(data).success;
}
