import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import {
	arePistonRuntimes,
	ErrorResponse,
	httpRequestMethod,
	isPistonExecutionResponse,
	PistonExecutionRequest,
	pistonUrls,
	POST
} from "types";

async function piston(fastify: FastifyInstance) {
	fastify.decorate("piston", async (pistonExecutionRequestObject: PistonExecutionRequest) => {
		const PISTON_API = process.env.PISTON_URI;

		if (!PISTON_API) {
			throw new Error("PISTON_API is not defined in environment variables");
		}

		const res = await fetch(`${PISTON_API}${pistonUrls.EXECUTE}`, {
			method: POST,
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify(pistonExecutionRequestObject)
		});

		const executionResponse = await res.json();

		if (!isPistonExecutionResponse(executionResponse)) {
			const error: ErrorResponse = {
				error: "Unknown error with piston",
				message: "response is not a piston execution response"
			};

			return error;
		}

		return executionResponse;
	});

	fastify.decorate("runtimes", async () => {
		const PISTON_API = process.env.PISTON_URI;

		if (!PISTON_API) {
			throw new Error("PISTON_API is not defined in environment variables");
		}

		const response = await fetch(`${PISTON_API}${pistonUrls.RUNTIMES}`, {
			method: httpRequestMethod.GET,
			headers: {
				"Content-Type": "application/json"
			}
		});

		if (!response.ok) {
			throw new Error(`Failed to execute code: ${response.status} - ${response.statusText}`);
		}

		const pistonRuntimesResponse = await response.json();

		if (!arePistonRuntimes(pistonRuntimesResponse)) {
			const error: ErrorResponse = {
				error: "Unknown error with piston",
				message: "response are not a piston runtimes"
			};

			return error;
		}

		return pistonRuntimesResponse;
	});
}

export default fastifyPlugin(piston);
