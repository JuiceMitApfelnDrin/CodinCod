import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import {
	httpRequestMethod,
	PistonExecutionRequest,
	PistonExecutionResponse,
	PistonRuntime,
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
		const executionRes: PistonExecutionResponse = await res.json();

		return executionRes;
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

		const pistonRuntimesResponse: PistonRuntime[] = await response.json();

		return pistonRuntimesResponse;
	});
}

export default fastifyPlugin(piston);
