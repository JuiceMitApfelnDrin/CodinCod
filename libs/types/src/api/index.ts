import { z } from "zod";

export * from "./auth/login.js";
export * from "./auth/register.js";
export * from "./user/index.js";
export * from "./puzzle/index.js";
export * from "./submission/index.js";
export * from "./comment/index.js";
export * from "./execute/index.js";
export * from "./account/index.js";
export * from "./health/index.js";
export * from "./enum/http-response-codes.js";

export const apiErrorResponseSchema = z.object({
	error: z.string(),
	message: z.string(),
	timestamp: z.string(),
	url: z.string(),
	details: z.optional(z.record(z.string(), z.string())),
});

export const apiSuccessResponseSchema = z.object({
	message: z.string(),
	data: z.any().optional(),
});

export const API_VERSION = "v1" as const;
