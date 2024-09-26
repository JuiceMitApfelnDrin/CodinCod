import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { PistonExecuteRequest, PistonExecuteResponse, pistonUrls, POST } from "types";

async function piston(fastify: FastifyInstance) {
	fastify.decorate("piston", async (pistonExecutionRequestObject: PistonExecuteRequest) => {
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
		const executionRes: PistonExecuteResponse = await res.json();

		return executionRes;
	});
}

export default fastifyPlugin(piston);
