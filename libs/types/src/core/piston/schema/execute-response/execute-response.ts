import { z } from "zod";
import { pistonExecutionResponseSuccessSchema } from "./execute-response-success.js";
import { pistonExecutionResponseErrorSchema } from "./execute-response-error.js";

export const pistonExecutionResponseSchema = pistonExecutionResponseSuccessSchema.or(
	pistonExecutionResponseErrorSchema
);
export type PistonExecutionResponse = z.infer<typeof pistonExecutionResponseSchema>;
