import { z } from "zod";
import { messageSchema } from "../../../common/schema/message.schema.js";

/**
 * POST /login - User login
 */
export const loginRequestSchema = z.object({
	identifier: z.string().min(1, "Identifier is required"),
	password: z.string().min(1, "Password is required")
});

export const loginResponseSchema = messageSchema;

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
