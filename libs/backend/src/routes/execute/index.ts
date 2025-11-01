import { FastifyInstance } from "fastify";
import {
	arePistonRuntimes,
	ERROR_MESSAGES,
	ErrorResponse,
	httpResponseCodes,
	isFetchError,
	isPistonExecutionResponseSuccess,
	PistonExecutionRequest,
	PistonExecutionResponse,
	ExecuteAPI
} from "types";
import { findRuntime } from "@/utils/functions/findRuntimeInfo.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import checkUserBan from "@/plugins/middleware/check-user-ban.js";
import { calculateResults } from "@/utils/functions/calculate-result.js";
import { validateBody } from "@/plugins/middleware/validate-body.js";

export const executionResponseErrors = {
	UNSUPPORTED_LANGUAGE: {
		error: "Unsupported language",
		message: "At the moment we don't support this language."
	},
	SERVICE_UNAVAILABLE: {
		error: ERROR_MESSAGES.SERVER.INTERNAL_ERROR,
		message: ERROR_MESSAGES.FETCH.NETWORK_ERROR
	},
	INTERNAL_SERVER_ERROR: {
		error: ERROR_MESSAGES.SERVER.INTERNAL_ERROR,
		message: ERROR_MESSAGES.GENERIC.SOMETHING_WENT_WRONG
	},
	PISTON_ERROR: {
		error: "Piston error"
	}
} as const;

export default async function executeRoutes(fastify: FastifyInstance) {
	/**
	 * POST /execute - Execute code without creating a submission
	 * Uses specific ExecuteAPI types
	 */
	fastify.post<{ Body: ExecuteAPI.ExecuteCodeRequest }>(
		"/",
		{
			onRequest: [authenticated, checkUserBan],
			preHandler: validateBody(ExecuteAPI.executeCodeRequestSchema),
			config: {
				rateLimit: {
					max: 30,
					timeWindow: "1 minute"
				}
			}
		},
		async (request, reply) => {
			const { code, language, testInput, testOutput } = request.body;

			const runtimes = await fastify.runtimes();

			if (!arePistonRuntimes(runtimes)) {
				const error: ErrorResponse = runtimes;

				return reply
					.status(httpResponseCodes.SERVER_ERROR.SERVICE_UNAVAILABLE)
					.send(error);
			}

			const runtimeInfo = findRuntime(runtimes, language);

			if (!runtimeInfo) {
				const error: ErrorResponse =
					executionResponseErrors.UNSUPPORTED_LANGUAGE;
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
					.send(error);
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
					const error: ErrorResponse =
						executionResponseErrors.SERVICE_UNAVAILABLE;
					return reply
						.status(httpResponseCodes.SERVER_ERROR.SERVICE_UNAVAILABLE)
						.send(error);
				}

				const error: ErrorResponse =
					executionResponseErrors.INTERNAL_SERVER_ERROR;
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send(error);
			}

			if (!isPistonExecutionResponseSuccess(executionRes)) {
				const error: ErrorResponse = {
					error: executionResponseErrors.PISTON_ERROR.error,
					message: executionRes.message
				};

				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send(error);
			}

			const codeExecutionResponse: ExecuteAPI.ExecuteCodeResponse = {
				run: executionRes.run,
				compile: executionRes.compile,
				puzzleResultInformation: calculateResults([testOutput], [executionRes])
			};

			return reply
				.status(httpResponseCodes.SUCCESSFUL.OK)
				.send(codeExecutionResponse);
		}
	);
}
