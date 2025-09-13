import { FastifyInstance } from "fastify";
import {
	executeCodeRequestSchema,
	executeCodeSuccessResponseSchema,
	executeErrorResponseSchema,
	type ExecuteCodeRequest,
	type ExecuteCodeSuccessResponse,
	type ExecuteErrorResponse,
	PistonExecutionRequest,
	isPistonExecutionResponseSuccess,
	httpResponseCodes
} from "types";
import authenticated from "@/plugins/middleware/authenticated.js";
import { calculateResults } from "@/utils/functions/calculate-result.js";
import {
	validatePistonService,
	validateLanguageSupport,
	executePistonRequest
} from "@/helpers/piston.helpers.js";
import {
	formatZodIssues,
	sendValidationError
} from "@/helpers/error.helpers.js";

export default async function executeRoutes(fastify: FastifyInstance) {
	fastify.post<{
		Body: ExecuteCodeRequest;
		Reply: ExecuteCodeSuccessResponse | ExecuteErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Execute code with test inputs and get results",
				tags: ["Code Execution"],
				security: [{ bearerAuth: [] }],
				body: executeCodeRequestSchema,
				response: {
					200: executeCodeSuccessResponseSchema,
					400: executeErrorResponseSchema,
					401: executeErrorResponseSchema,
					500: executeErrorResponseSchema
				}
			},
			preHandler: [authenticated]
		},
		async (request, reply) => {
			const result = executeCodeRequestSchema.safeParse(request.body);

			if (!result.success) {
				return sendValidationError(
					reply,
					"Invalid request data",
					formatZodIssues(result.error),
					request.url
				);
			}

			const { code, language, testInput, testOutput } = result.data;

			const runtimes = await validatePistonService(fastify, reply, request.url);

			if (!runtimes) {
				return;
			}

			const runtimeInfo = validateLanguageSupport(
				runtimes,
				language,
				reply,
				request.url
			);

			if (!runtimeInfo) {
				return;
			}

			const requestObject: PistonExecutionRequest = {
				language: runtimeInfo.language,
				version: runtimeInfo.version,
				files: [{ content: code }],
				stdin: testInput
			};

			const executionRes = await executePistonRequest(
				fastify,
				requestObject,
				reply,
				request.url
			);
			if (!executionRes) {
				return;
			}

			if (!isPistonExecutionResponseSuccess(executionRes)) {
				return reply.status(400).send({
					error: "EXECUTION_ERROR",
					message: "Code execution failed",
					timestamp: new Date().toISOString(),
					url: request.url,
					details: { output: executionRes.message }
				});
			}

			return reply.status(httpResponseCodes.SUCCESSFUL.OK).send({
				run: executionRes.run,
				compile: executionRes.compile,
				puzzleResultInformation: calculateResults([testOutput], [executionRes])
			});
		}
	);
}
