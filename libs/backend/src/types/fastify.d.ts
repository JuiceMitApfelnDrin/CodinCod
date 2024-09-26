import "fastify";

declare module "fastify" {
	interface FastifyInstance {
		authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
		piston(pistonExecutionRequestObject: PistonExecuteRequest): Promise<PistonExecuteResponse>;
	}
	interface FastifyRequest {
		user?: { userId: string }; // Extend the request type to include user
	}
}
