import { z } from "zod";
import { registerSchema } from "../../core/authentication/schema/register.schema.js";
import { loginResponseSchema } from "../../core/authentication/schema/login-response.schema.js";

export const registerRequestSchema = registerSchema;
export const registerSuccessResponseSchema = loginResponseSchema;
export const registerErrorResponseSchema = z.object({
	error: z.string(),
	message: z.string(),
	timestamp: z.string(),
	url: z.string(),
	details: z.optional(z.record(z.string(), z.string())),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
export type RegisterSuccessResponse = z.infer<
	typeof registerSuccessResponseSchema
>;
export type RegisterErrorResponse = z.infer<typeof registerErrorResponseSchema>;
