import { FastifyInstance } from "fastify";
import {
	httpResponseCodes,
	PistonExecutionResponse,
	SubmissionEntity,
	CodeSubmissionParams,
	codeSubmissionParamsSchema,
	PistonExecutionRequest,
	ErrorResponse,
	arePistonRuntimes
} from "types";
import Submission from "../../models/submission/submission.js";
import Puzzle, { PuzzleDocument } from "../../models/puzzle/puzzle.js";
import { isValidationError } from "../../utils/functions/is-validation-error.js";
import { findRuntime } from "@/utils/functions/findRuntimeInfo.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import { calculateResults } from "@/utils/functions/calculate-result.js";

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

			if (!arePistonRuntimes(runtimes)) {
				const error: ErrorResponse = runtimes;

				return reply.status(httpResponseCodes.SERVER_ERROR.SERVICE_UNAVAILABLE).send(error);
			}

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

			const pistonExecutionResults: PistonExecutionResponse[] = [];
			const expectedOutputs: string[] = [];

			const promises = puzzle.validators.map(async (validator) => {
				const pistonRequest: PistonExecutionRequest = {
					files: [{ content: code }],
					language: runtimeInfo.language,
					stdin: validator.input,
					version: runtimeInfo.version
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
				const submissionData: SubmissionEntity = {
					code: code,
					createdAt: new Date(),
					language: runtimeInfo.language,
					languageVersion: runtimeInfo.version,
					puzzle: puzzleId,
					result: calculateResults(expectedOutputs, pistonExecutionResults),
					user: userId
				};

				const submission = new Submission(submissionData);
				await submission.save();

				return reply.status(201).send(submission);
			} catch (error) {
				fastify.log.error("Error saving submission:", error);

				if (isValidationError(error)) {
					return reply.status(400).send({ details: error.errors, error: "Validation failed" });
				}

				return reply.status(500).send({ error: "Failed to create submission" });
			}
		}
	);
}
