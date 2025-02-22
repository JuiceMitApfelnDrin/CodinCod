import { FastifyInstance } from "fastify";
import {
	CodeExecutionParams,
	ErrorResponse,
	httpResponseCodes,
	isFetchError,
	isPistonExecutionResponseSuccess,
	PistonExecutionRequest,
	PistonExecutionResponse
} from "types";
import { findRuntime } from "@/utils/functions/findRuntimeInfo.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import { calculateResults } from "@/utils/functions/calculate-result.js";

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
				const error: ErrorResponse = {
					error: "Unsupported language",
					message: "At the moment we don't support this language."
				};

				return reply.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST).send(error);
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
					const error: ErrorResponse = {
						error: "Service unavailable",
						message: "Unable to reach piston code execution service"
					};

					return reply.status(httpResponseCodes.SERVER_ERROR.SERVICE_UNAVAILABLE).send(error);
				}

				const error: ErrorResponse = {
					error: "Internal Server Error",
					message: "Something went wrong during piston code execution"
				};

				return reply.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(error);
			}

			if (!isPistonExecutionResponseSuccess(executionRes)) {
				const error: ErrorResponse = {
					error: "Error with piston.",
					message: executionRes.message
				};

				return reply.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(error);
			}

			let run = executionRes.run;
			let compile = executionRes.compile;

			const codeExecutionResponse = {
				run,
				compile,
				puzzleResultInformation: calculateResults([testOutput], [executionRes])
			};

			return reply.status(200).send(codeExecutionResponse);
		}
	);
}
