import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
	healthCheckSuccessResponseSchema,
	type HealthCheckRequest,
	type HealthCheckSuccessResponse,
	healthResponse,
	httpResponseCodes
} from "types";

export default async function healthRoutes(fastify: FastifyInstance) {
	fastify.get<{
		Body: HealthCheckRequest;
		Reply: HealthCheckSuccessResponse;
	}>(
		"/",
		{
			schema: {
				description: "Health check endpoint to verify service status",
				tags: ["Health"],
				response: {
					[httpResponseCodes.SUCCESSFUL.OK]: healthCheckSuccessResponseSchema
				}
			}
		},
		async (request: FastifyRequest, reply: FastifyReply) => {
		const response: HealthCheckSuccessResponse = {
			status: healthResponse,
			timestamp: new Date().toISOString(),
			uptime: process.uptime(),
			version: process.env.npm_package_version || process.env.VERSION,
			environment: process.env.NODE_ENV || process.env.ENVIRONMENT
		};

		reply.send(response);
	});
}
