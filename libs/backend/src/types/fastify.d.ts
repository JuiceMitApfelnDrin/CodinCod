import "fastify";
import { PistonRuntime } from "types";

declare module "fastify" {
	interface FastifyInstance {
		authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
		piston(pistonExecutionRequestObject: PistonExecutionRequest): Promise<PistonExecutionResponse>;
		runtimes(): Promise<PistonRuntime[]>;
	}
	interface FastifyRequest {
		user?: { userId: string }; // Extend the request type to include user
	}
}
