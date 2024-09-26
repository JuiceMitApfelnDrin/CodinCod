import { z } from "zod";
import { pistonExecuteResponseSuccessSchema } from "./execute-response-success.js";
import { pistonExecuteResponseErrorSchema } from "./execute-response-error.js";

export const pistonExecuteResponseSchema = pistonExecuteResponseSuccessSchema.or(
	pistonExecuteResponseErrorSchema
);
export type PistonExecuteResponse = z.infer<typeof pistonExecuteResponseSchema>;
