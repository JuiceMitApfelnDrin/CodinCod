import { FastifyInstance } from "fastify";
import {
	httpResponseCodes,
	PistonExecutionResponse,
	PistonExecutionRequest,
	ErrorResponse,
	arePistonRuntimes,
	SubmissionAPI
} from "types";
import mongoose from "mongoose";
import Submission from "../../models/submission/submission.js";
import Puzzle, { PuzzleDocument } from "../../models/puzzle/puzzle.js";
import { isValidationError } from "../../utils/functions/is-validation-error.js";
import { findRuntime } from "@/utils/functions/findRuntimeInfo.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import checkUserBan from "@/plugins/middleware/check-user-ban.js";
import { validateBody } from "@/plugins/middleware/validate-body.js";
import { calculateResults } from "@/utils/functions/calculate-result.js";
import ProgrammingLanguage from "../../models/programming-language/language.js";

export default async function submissionRoutes(fastify: FastifyInstance) {
	/**
	 * POST /submission - Create a new code submission
	 * Uses specific SubmissionAPI types instead of generic DTOs
	 */
	fastify.post<{ Body: SubmissionAPI.SubmitCodeRequest }>(
		"/",
		{
			onRequest: [authenticated, checkUserBan],
			preHandler: validateBody(SubmissionAPI.submitCodeRequestSchema),
			config: {
				rateLimit: {
					max: 10,
					timeWindow: "1 minute"
				}
			}
		},
		async (request, reply) => {
			const { programmingLanguageId, puzzleId, code, userId } = request.body;

			// Retrieve puzzle and test cases
			const puzzle: PuzzleDocument | null = await Puzzle.findById(puzzleId);

			if (!puzzle) {
				return reply.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND).send({
					error: `Puzzle with id (${puzzleId}) couldn't be found.`
				});
			}

			if (!puzzle.validators || puzzle.validators.length === 0) {
				return reply.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST).send({
					error:
						"This puzzle isn't finished, it should have test cases / validators"
				});
			}

			// Get piston runtimes
			const runtimes = await fastify.runtimes();

			if (!arePistonRuntimes(runtimes)) {
				const error: ErrorResponse = runtimes;
				return reply
					.status(httpResponseCodes.SERVER_ERROR.SERVICE_UNAVAILABLE)
					.send(error);
			}

			// Find programming language
			const language = await ProgrammingLanguage.findById(
				programmingLanguageId
			);

			if (!language) {
				return reply.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST).send({
					error: "Invalid programming language"
				});
			}

			const runtimeInfo = findRuntime(runtimes, language.language);

			if (!runtimeInfo) {
				return reply.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST).send({
					error: `Unsupported language: ${language.language}`
				});
			}

			// Execute code against all test cases
			const pistonExecutionResults: PistonExecutionResponse[] = [];
			const expectedOutputs: string[] = [];

			const promises = puzzle.validators.map(async (validator) => {
				const pistonRequest: PistonExecutionRequest = {
					language: runtimeInfo.language,
					version: runtimeInfo.version,
					files: [{ content: code }],
					stdin: validator.input
				};
				const executionResponse = await fastify.piston(pistonRequest);
				return { executionResponse, output: validator.output };
			});

			const results = await Promise.all(promises);

			results.forEach(({ executionResponse, output }) => {
				pistonExecutionResults.push(executionResponse);
				expectedOutputs.push(output);
			});

			try {
				const result = calculateResults(
					expectedOutputs,
					pistonExecutionResults
				);

				const submission = new Submission({
					code: code,
					puzzle: puzzleId,
					user: userId,
					createdAt: new Date(),
					programmingLanguage: programmingLanguageId,
					result: {
						result: result.result,
						successRate: result.successRate
					}
				});

				await submission.save();

				// Return response with specific type - cast to satisfy type checking
				const response = {
					submissionId: (submission._id as mongoose.Types.ObjectId).toString(),
					code: submission.code ?? code,
					puzzleId: submission.puzzle.toString(),
					programmingLanguageId: submission.programmingLanguage.toString(),
					userId: submission.user.toString(),
					result: {
						successRate: result.successRate,
						passed: result.passed,
						failed: result.failed,
						total: result.total
					},
					createdAt: new Date(submission.createdAt).toISOString(),
					codeLength: code.length
				} as SubmissionAPI.SubmitCodeResponse;

				return reply
					.status(httpResponseCodes.SUCCESSFUL.CREATED)
					.send(response);
			} catch (error) {
				fastify.log.error(error, "Error saving submission");

				if (isValidationError(error)) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
						.send({ error: "Validation failed" });
				}
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to create submission" });
			}
		}
	);
}
