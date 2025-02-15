import { FastifyInstance } from "fastify";
import {
	httpResponseCodes,
	isPistonExecutionResponseError,
	isPistonExecutionResponseSuccess,
	PistonExecutionResponse,
	PuzzleResultEnum,
	SubmissionEntity,
	CodeSubmissionParams,
	codeSubmissionParamsSchema
} from "types";
import Submission from "../../models/submission/submission.js";
import Puzzle, { PuzzleDocument } from "../../models/puzzle/puzzle.js";
import { isValidationError } from "../../utils/functions/is-validation-error.js";
import { findRuntime } from "@/utils/functions/findRuntimeInfo.js";
import authenticated from "@/plugins/middleware/authenticated.js";

export default async function submissionRoutes(fastify: FastifyInstance) {
	fastify.post<{ Body: CodeSubmissionParams }>(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			const parseResult = codeSubmissionParamsSchema.safeParse(request.body);

			if (!parseResult.success) {
				return reply.status(400).send({ error: parseResult.error.errors });
			}

			// unpacking body
			const { language, puzzleId, code, userId } = request.body;

			// retrieve test cases
			const puzzle: PuzzleDocument | null = await Puzzle.findById(puzzleId);

			if (!puzzle) {
				return reply.send({
					error: `Puzzle with id (${puzzleId}) couldn't be found.`
				});
			}

			// prepare the execution of tests
			const runtimes = await fastify.runtimes();
			const runtimeInfo = findRuntime(runtimes, language);

			if (!runtimeInfo) {
				return reply.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST).send({
					error: "Unsupported language"
				});
			}

			// foreach test case, execute the code and see the result, compare to test-case expected output
			if (!puzzle.validators) {
				return reply.send({
					// TODO: improve this text
					error: "This puzzle isn't finished, it should have test cases / validators"
				});
			}

			const pistonExecutionRequests = puzzle.validators.map((validator) => {
				return {
					language: runtimeInfo.language,
					version: runtimeInfo.version,
					files: [{ content: code }],
					stdin: validator.input,
					expectedOutput: validator.output
				};
			});

			const pistonExecutionResponses = await Promise.all(
				pistonExecutionRequests.map(async (request) => {
					const response: PistonExecutionResponse = await fastify.piston(request);

					if (isPistonExecutionResponseError(response)) {
						return {
							response,
							stdin: request.stdin,
							isMatch: false
						};
					}

					if (isPistonExecutionResponseSuccess(response)) {
						const expectedOutput = request.expectedOutput.trimEnd();

						return {
							response,
							stdin: request.stdin,
							isMatch:
								response.run.output.trimEnd() === expectedOutput ||
								response.run.stdout.trimEnd() === expectedOutput
						};
					}

					return { isMatch: false };
				})
			);

			const matchCount = pistonExecutionResponses.filter((res) => res.isMatch).length;

			try {
				const submissionData: SubmissionEntity = {
					code: code,
					puzzle: puzzleId,
					user: userId,
					createdAt: new Date(),
					languageVersion: runtimeInfo.version,
					result:
						puzzle.validators.length === matchCount
							? PuzzleResultEnum.SUCCESS
							: PuzzleResultEnum.ERROR,
					language: runtimeInfo.language
				};

				const submission = new Submission(submissionData);
				await submission.save();

				return reply.status(201).send(submission);
			} catch (error) {
				fastify.log.error("Error saving submission:", error);

				if (isValidationError(error)) {
					return reply.status(400).send({ error: "Validation failed", details: error.errors });
				}

				return reply.status(500).send({ error: "Failed to create submission" });
			}
		}
	);
}
