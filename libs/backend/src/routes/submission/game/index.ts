import { FastifyInstance } from "fastify";
import {
	getUserIdFromUser,
	httpResponseCodes,
	isAuthor,
	isString,
	SUBMISSION_BUFFER_IN_MILLISECONDS,
	gameModeEnum,
	SubmissionAPI
} from "types";
import { isValidationError } from "../../../utils/functions/is-validation-error.js";
import Submission from "@/models/submission/submission.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import checkUserBan from "@/plugins/middleware/check-user-ban.js";
import { gameService } from "@/services/game.service.js";
import { gameModeService } from "@/services/game-mode.service.js";
import { validateBody } from "@/plugins/middleware/validate-body.js";

export default async function submissionGameRoutes(fastify: FastifyInstance) {
	/**
	 * POST /submission/game - Submit code to a multiplayer game
	 * Uses specific SubmissionAPI types
	 */
	fastify.post<{ Body: SubmissionAPI.SubmitToGameRequest }>(
		"/",
		{
			onRequest: [authenticated, checkUserBan],
			preHandler: validateBody(SubmissionAPI.submitToGameRequestSchema)
		},
		async (request, reply) => {
			const { gameId, submissionId, userId } = request.body;

			try {
				const matchingSubmission = await Submission.findById(submissionId)
					.populate("programmingLanguage")
					.exec();

				if (
					!matchingSubmission ||
					getUserIdFromUser(matchingSubmission.user) !== userId
				) {
					return reply.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND).send({
						error: `couldn't find a submission with id (${submissionId}) belonging to user with id (${userId})`
					});
				}

				const matchingGame = await gameService.findByIdPopulated(gameId);

				if (!matchingGame) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
						.send({ error: `couldn't find a game with id (${gameId})` });
				}

				const gameMode = matchingGame.options?.mode ?? gameModeEnum.FASTEST;
				const validation = gameModeService.validateSubmissionForMode(gameMode, {
					result: matchingSubmission.result,
					attempts: 1
				});

				if (!validation.valid) {
					return reply.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST).send({
						error: `Submission invalid for ${gameMode} mode`,
						reason: validation.reason
					});
				}

				const latestSubmissionTime =
					new Date(matchingSubmission.createdAt).getTime() +
					SUBMISSION_BUFFER_IN_MILLISECONDS;
				const currentTime = Date.now();
				const tooFarInThePast = latestSubmissionTime < currentTime;

				if (tooFarInThePast) {
					return reply.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST).send({
						error: `Submission too old for game with id (${gameId})`
					});
				}

				const gameHasExistingUserSubmission =
					matchingGame.playerSubmissions.find((submission) => {
						if (isString(submission)) {
							return false;
						}

						return isAuthor(getUserIdFromUser(submission.user), userId);
					});

				if (gameHasExistingUserSubmission) {
					return reply.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST).send({
						error: `User ${userId} has already submitted to game ${gameId}`
					});
				}

				// Add submission to game
				const uniquePlayerSubmissions = new Set([
					...(matchingGame.playerSubmissions ?? []),
					submissionId
				]);

				matchingGame.playerSubmissions = Array.from(uniquePlayerSubmissions);

				const updatedGame = await matchingGame.save();

				// Calculate leaderboard position
				const leaderboard = gameModeService.getGameLeaderboard(
					updatedGame,
					await Submission.find({
						_id: { $in: updatedGame.playerSubmissions }
					})
						.populate("user")
						.exec()
				);

				const userPosition = leaderboard.findIndex(
					(entry) => entry.userId === userId
				);

				// Build response using specific type
				const response: SubmissionAPI.SubmitToGameResponse = {
					success: true,
					message: "Submission successfully added to game",
					game: {
						id: (
							updatedGame._id as import("mongoose").Types.ObjectId
						).toString(),
						status: "in_progress", // Could be calculated based on game state
						playerCount: updatedGame.players?.length ?? 0
					},
					leaderboardPosition:
						userPosition !== -1 ? userPosition + 1 : undefined
				};

				return reply
					.status(httpResponseCodes.SUCCESSFUL.CREATED)
					.send(response);
			} catch (error) {
				request.log.error({ err: error }, "Error submitting to game");

				if (isValidationError(error)) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
						.send({ error: "Validation failed", details: error.errors });
				}
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to submit to game" });
			}
		}
	);
}
