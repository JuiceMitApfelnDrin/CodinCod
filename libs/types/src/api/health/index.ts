import { z } from "zod";

export const healthResponse = "OK";

export const healthCheckRequestSchema = z.object({});

export const healthCheckSuccessResponseSchema = z.object({
	status: z.literal(healthResponse),
	timestamp: z.string(),
	uptime: z.number(),
	version: z.string().optional(),
	environment: z.string().optional(),
});

export type HealthCheckRequest = z.infer<typeof healthCheckRequestSchema>;
export type HealthCheckSuccessResponse = z.infer<
	typeof healthCheckSuccessResponseSchema
>;
