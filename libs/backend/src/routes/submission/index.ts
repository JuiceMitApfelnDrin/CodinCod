import { FastifyInstance } from "fastify";
import {
	createSubmissionRequestSchema,
	createSubmissionSuccessResponseSchema,
	submissionErrorResponseSchema,
	type CreateSubmissionRequest,
	type CreateSubmissionSuccessResponse,
	type SubmissionErrorResponse,
	SubmissionEntity,
	PistonExecutionRequest
} from "types";
import Submission from "../../models/submission/submission.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import { calculateResults } from "@/utils/functions/calculate-result.js";
import {
	validatePistonService,
	validateLanguageSupport
} from "@/helpers/piston.helpers.js";
import {
	findPuzzleById,
	validatePuzzleForSubmission
} from "@/helpers/puzzle.helpers.js";
import {
	sendValidationError,
	handleAndSendError,
	formatZodIssues
} from "@/helpers/error.helpers.js";

export default async function submissionRoutes(fastify: FastifyInstance) {
	fastify.post<{
		Body: CreateSubmissionRequest;
		Reply: CreateSubmissionSuccessResponse | SubmissionErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Submit code for a puzzle to be validated",
				tags: ["Submissions"],
				security: [{ bearerAuth: [] }],
				body: createSubmissionRequestSchema,
				response: {
					201: createSubmissionSuccessResponseSchema,
					400: submissionErrorResponseSchema,
					401: submissionErrorResponseSchema,
					404: submissionErrorResponseSchema,
					500: submissionErrorResponseSchema
				}
			},
			preHandler: [authenticated]
		},
		async (request, reply) => {
			const parseResult = createSubmissionRequestSchema.safeParse(request.body);

			if (!parseResult.success) {
				sendValidationError(
					reply,
					"Invalid submission data",
					formatZodIssues(parseResult.error),
					request.url
				);
				return;
			}

			const { language, puzzleId, code, userId } = parseResult.data;

			const puzzle = await findPuzzleById(puzzleId, reply, request.url);
			if (!puzzle) {
				return;
			}

			if (!validatePuzzleForSubmission(puzzle, reply, request.url)) {
				return;
			}

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

			if (!puzzle.validators || puzzle.validators.length === 0) {
				return sendValidationError(
					reply,
					"Puzzle has no validators",
					{},
					request.url
				);
			}

			const executionPromises = puzzle.validators.map(
				async (validator: any) => {
					const pistonRequest: PistonExecutionRequest = {
						language: runtimeInfo.language,
						version: runtimeInfo.version,
						files: [{ content: code }],
						stdin: validator.input
					};

					const executionResponse = await fastify.piston(pistonRequest);

					return { executionResponse, output: validator.output };
				}
			);

			try {
				const results = await Promise.all(executionPromises);

				const pistonExecutionResults = results.map(
					(r: any) => r.executionResponse
				);
				const expectedOutputs = results.map((r: any) => r.output);

				const submissionData: SubmissionEntity = {
					code: code,
					puzzle: puzzleId,
					user: userId,
					createdAt: new Date(),
					languageVersion: runtimeInfo.version,
					result: calculateResults(expectedOutputs, pistonExecutionResults),
					language: runtimeInfo.language
				};

				const submission = new Submission(submissionData);
				await submission.save();

				return reply.status(201).send(submissionData);
			} catch (error) {
				return handleAndSendError(reply, error, request.url);
			}
		}
	);
}
