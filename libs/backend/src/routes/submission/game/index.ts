import { FastifyInstance } from "fastify";
import {
	getUserIdFromUser,
	isAuthor,
	isString,
	SUBMISSION_BUFFER_IN_MILLISECONDS,
	SubmissionEntity,
	linkSubmissionToGameRequestSchema,
	linkSubmissionToGameSuccessResponseSchema,
	submissionErrorResponseSchema,
	type LinkSubmissionToGameRequest,
	type LinkSubmissionToGameSuccessResponse,
	type SubmissionErrorResponse,
	httpResponseCodes
} from "types";
import Game from "@/models/game/game.js";
import Submission from "@/models/submission/submission.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import {
	handleAndSendError,
	sendNotFoundError,
	sendValidationError
} from "@/helpers/error.helpers.js";

export default async function submissionGameRoutes(fastify: FastifyInstance) {
	fastify.post<{
		Body: LinkSubmissionToGameRequest;
		Reply: LinkSubmissionToGameSuccessResponse | SubmissionErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Link an existing submission to a game",
				tags: ["Submissions", "Games"],
				security: [{ bearerAuth: [] }],
				body: linkSubmissionToGameRequestSchema,
				response: {
					[httpResponseCodes.SUCCESSFUL.CREATED]: linkSubmissionToGameSuccessResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.BAD_REQUEST]: submissionErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED]: submissionErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.NOT_FOUND]: submissionErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: submissionErrorResponseSchema
				}
			},
			preHandler: [authenticated]
		},
		async (request, reply) => {
			// unpacking body
			const { gameId, submissionId, userId } = request.body;

			try {
				const matchingSubmission =
					await Submission.findById<SubmissionEntity>(submissionId).exec();

				if (
					!matchingSubmission ||
					matchingSubmission.user.toString() !== userId
				) {
					return sendNotFoundError(
						reply,
						`Couldn't find a submission with id (${submissionId}) belonging to user with id (${userId})`
					);
				}

				const matchingGame = await Game.findById(gameId)
					.populate("playerSubmissions")
					.exec();

				if (!matchingGame) {
					return sendNotFoundError(
						reply,
						`Couldn't find a game with id (${gameId})`
					);
				}

				const latestSubmissionTime =
					new Date(matchingSubmission.createdAt).getTime() +
					SUBMISSION_BUFFER_IN_MILLISECONDS;
				const currentTime = new Date().getTime();

				const tooFarInThePast = latestSubmissionTime < currentTime;
				if (tooFarInThePast) {
					return sendValidationError(
						reply,
						`Game with id (${gameId}) already finished`
					);
				}

				const gameHasExistingUserSubmission =
					matchingGame.playerSubmissions.find((submission) => {
						if (isString(submission)) {
							return false;
						}

						return isAuthor(getUserIdFromUser(submission.user), userId);
					});

				if (gameHasExistingUserSubmission) {
					return sendValidationError(
						reply,
						`Game with id (${gameId}) has a game from user with id (${userId})`
					);
				}

				const uniquePlayerSubmissions = new Set([
					...(matchingGame.playerSubmissions ?? []),
					submissionId
				]);

				matchingGame.playerSubmissions = Array.from(uniquePlayerSubmissions);

				await matchingGame.save();

				return reply.status(201).send({
					message: "Submission linked to game successfully",
					gameId: gameId,
					submissionId: submissionId
				});
			} catch (error) {
				request.log.error(
					`Error saving submission: ${error instanceof Error ? error.message : String(error)}`
				);
				return handleAndSendError(reply, error, request.url);
			}
		}
	);
}
