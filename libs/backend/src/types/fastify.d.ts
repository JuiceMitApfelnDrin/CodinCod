import "fastify";
import { ErrorResponse, PistonRuntime } from "types";

declare module "fastify" {
	interface FastifyInstance {
		authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
		piston(
			pistonExecutionRequestObject: PistonExecutionRequest
		): Promise<PistonExecutionResponse | ErrorResponse>;
		runtimes(): Promise<PistonRuntime[] | ErrorResponse>;
	}
	interface FastifyRequest {
		user?: { userId: string; username: string }; // Extend the request type to include user
	}
}
