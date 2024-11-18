import { FastifyInstance } from "fastify";
import {
	isAuthenticatedInfo,
	isPistonExecutionResponseError,
	isPistonExecutionResponseSuccess,
	isString,
	PistonExecutionResponse,
	SubmissionEntity,
	submissionEntitySchema,
	SubmissionParams,
	supportedLanguages
} from "types";
import authenticated from "../../plugins/middleware/authenticated.js";
import Submission from "../../models/submission/submission.js";
import Puzzle, { PuzzleDocument } from "../../models/puzzle/puzzle.js";
import { PuzzleResultEnum } from "types/dist/enums/puzzle-result-enum.js";
import { isValidationError } from "../../utils/functions/is-validation-error.js";
import Game from "@/models/game/game.js";

export default async function submissionController(fastify: FastifyInstance) {
	fastify.post<{ Body: SubmissionParams }>(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			const parseResult = submissionEntitySchema
				.pick({ code: true, puzzleId: true })
				.safeParse(request.body);

			if (!parseResult.success) {
				return reply.status(400).send({ error: parseResult.error.errors });
			}

			/**
			 * todo, have this checking credentials on multiple places, make this easier somehow :)
			 */
			if (!isAuthenticatedInfo(request.user)) {
				return reply.status(401).send({ error: "Not right credentials" });
			}

			const user = request.user;
			const userId = user.userId;

			// unpacking body
			const { language, puzzleId, code } = request.body;

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

				/**
				 * When user is part of an open game, also add the submission to the open game
				 * start:
				 */
				const puzzleId = puzzle._id;
				const matchingGame = await Game.findOne({
					players: userId,
					puzzle: puzzleId,
					endTime: {
						$lte: new Date(new Date(submission.createdAt).getTime() + 20 * 1000)
					}
				})
					.populate("playerSubmissions")
					.exec();

				if (matchingGame) {
					const playerSubmission = matchingGame.playerSubmissions?.find((submission) => {
						if (!isString(submission)) {
							return submission.userId == userId;
						}

						return false;
					});

					if (!playerSubmission) {
						matchingGame.playerSubmissions = [
							...(matchingGame.playerSubmissions ?? []),
							submission._id.toString()
						];

						await matchingGame.save();
					}
				}
				/**
				 * :end
				 */

				return reply.status(201).send(submission);
			} catch (error) {
				request.log.error("Error saving submission:", error);

				if (isValidationError(error)) {
					return reply.status(400).send({ error: "Validation failed", details: error.errors });
				}

				return reply.status(500).send({ error: "Failed to create submission" });
			}
		}
	);
}
