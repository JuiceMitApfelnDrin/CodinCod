import { FastifyInstance } from "fastify";
import {
	CodeExecutionParams,
	httpResponseCodes,
	isFetchError,
	isPistonExecutionResponseSuccess,
	PistonExecutionRequest,
	PistonExecutionResponse
} from "types";
import { calculateResult } from "../../utils/functions/calculate-result.js";
import { findRuntime } from "@/utils/functions/findRuntimeInfo.js";
import authenticated from "@/plugins/middleware/authenticated.js";

export default async function executeRoutes(fastify: FastifyInstance) {
	fastify.post<{ Body: CodeExecutionParams }>(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			const { code, language, testInput, testOutput } = request.body;

			const runtimes = await fastify.runtimes();
			const runtimeInfo = findRuntime(runtimes, language);

			if (!runtimeInfo) {
				return reply.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST).send({
					error: "Unsupported language"
				});
			}

			const requestObject: PistonExecutionRequest = {
				language: runtimeInfo.language,
				version: runtimeInfo.version,
				files: [{ content: code }],
				stdin: testInput
			};

			let executionRes: PistonExecutionResponse;
			try {
				executionRes = await fastify.piston(requestObject);
			} catch (err: unknown) {
				request.log.error(
					{
						err,
						requestBody: request.body
					},
					"Error during code execution"
				);

				if (isFetchError(err) && err.cause?.code === "ECONNREFUSED") {
					return reply.status(503).send({
						error: "Service unavailable",
						message: "Unable to reach piston code execution service"
					});
				}

				return reply.status(500).send({
					error: "Internal Server Error",
					message: "Something went wrong during piston code execution"
				});
			}

			if (!isPistonExecutionResponseSuccess(executionRes)) {
				return reply
					.status(500)
					.send({ error: "Error with piston.", message: executionRes.message });
			}

			let run = executionRes.run;
			let compile = executionRes.compile;

			run.result = calculateResult(run.output, testOutput);

			return reply.status(200).send({
				run,
				compile
			});
		}
	);
}
