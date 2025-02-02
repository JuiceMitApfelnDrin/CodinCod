import { FastifyInstance } from "fastify";
import {
	isPistonExecutionResponseError,
	isPistonExecutionResponseSuccess,
	PistonExecutionResponse,
	PuzzleResultEnum,
	SubmissionEntity,
	submissionEntitySchema,
	SubmissionParams,
	supportedLanguages
} from "types";
import Submission from "../../models/submission/submission.js";
import Puzzle, { PuzzleDocument } from "../../models/puzzle/puzzle.js";
import { isValidationError } from "../../utils/functions/is-validation-error.js";

export default async function submissionRoutes(fastify: FastifyInstance) {
	fastify.post<{ Body: SubmissionParams }>("/", async (request, reply) => {
		const parseResult = submissionEntitySchema
			.pick({ code: true, puzzleId: true })
			.safeParse(request.body);

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
		const executionLanguageDetails = supportedLanguages[language];

		// foreach test case, execute the code and see the result, compare to test-case expected output
		if (!puzzle.validators) {
			return reply.send({
				// TODO: improve this text
				error: "This puzzle isn't finished, it should have test cases / validators"
			});
		}

		const pistonExecutionRequests = puzzle.validators.map((validator) => {
			return {
				language: executionLanguageDetails.language,
				version: executionLanguageDetails.version,
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
					const expectedOutput = request.expectedOutput.trim();

					return {
						response,
						stdin: request.stdin,
						isMatch:
							response.run.output.trim() === expectedOutput ||
							response.run.stdout.trim() === expectedOutput
					};
				}

				return { isMatch: false };
			})
		);

		const matchCount = pistonExecutionResponses.filter((res) => res.isMatch).length;

		try {
			const submissionData: SubmissionEntity = {
				...parseResult.data,
				userId: userId,
				createdAt: new Date(),
				languageVersion: executionLanguageDetails.version,
				result:
					puzzle.validators.length === matchCount
						? PuzzleResultEnum.SUCCESS
						: PuzzleResultEnum.ERROR,
				language: executionLanguageDetails.language
			};

			const submission = new Submission(submissionData);
			await submission.save();

			return reply.status(201).send(submission);
		} catch (error) {
			request.log.error("Error saving submission:", error);

			if (isValidationError(error)) {
				return reply.status(400).send({ error: "Validation failed", details: error.errors });
			}

			return reply.status(500).send({ error: "Failed to create submission" });
		}
	});
}
