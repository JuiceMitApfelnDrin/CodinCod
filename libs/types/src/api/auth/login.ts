import { z } from "zod";
import { loginSchema } from "../../core/authentication/schema/login.schema.js";
import { loginResponseSchema } from "../../core/authentication/schema/login-response.schema.js";

export const loginRequestSchema = loginSchema;
export const loginSuccessResponseSchema = loginResponseSchema;
export const loginErrorResponseSchema = z.object({
	error: z.string(),
	message: z.string(),
	timestamp: z.string(),
	url: z.string(),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginSuccessResponse = z.infer<typeof loginSuccessResponseSchema>;
export type LoginErrorResponse = z.infer<typeof loginErrorResponseSchema>;
