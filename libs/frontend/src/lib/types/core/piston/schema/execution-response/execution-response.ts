import type { z } from "zod";
import { pistonExecutionResponseErrorSchema } from "./execution-error.js";
import { pistonExecutionResponseSuccessSchema } from "./execution-success.js";

export const pistonExecutionResponseSchema =
	pistonExecutionResponseSuccessSchema.or(pistonExecutionResponseErrorSchema);
export type PistonExecutionResponse = z.infer<
	typeof pistonExecutionResponseSchema
>;

export function isPistonExecutionResponse(
	data: unknown
): data is PistonExecutionResponse {
	return pistonExecutionResponseSchema.safeParse(data).success;
}
