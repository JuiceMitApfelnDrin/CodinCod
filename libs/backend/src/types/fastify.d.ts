import "fastify";

declare module "fastify" {
	interface FastifyInstance {
		authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
		piston(pistonExecutionRequestObject: PistonExecutionRequest): Promise<PistonExecutionResponse>;
	}
	interface FastifyRequest {
		user?: { userId: string }; // Extend the request type to include user
	}
}
