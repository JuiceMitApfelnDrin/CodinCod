import { FastifyInstance } from "fastify";
import {
	GameSubmissionParams,
	getUserIdFromUser,
	httpResponseCodes,
	isAuthor,
	isString,
	SUBMISSION_BUFFER_IN_MILLISECONDS,
	SubmissionEntity
} from "types";
import { isValidationError } from "../../../utils/functions/is-validation-error.js";
import Submission from "@/models/submission/submission.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import checkUserBan from "@/plugins/middleware/check-user-ban.js";
import { gameService } from "@/services/game.service.js";

export default async function submissionGameRoutes(fastify: FastifyInstance) {
	fastify.post<{ Body: GameSubmissionParams }>(
		"/",
		{
			onRequest: [authenticated, checkUserBan]
		},
		async (request, reply) => {
			// unpacking body
			const { gameId, submissionId, userId } = request.body;

			try {
				const matchingSubmission = await Submission.findById<SubmissionEntity>(
					submissionId
				)
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

				const latestSubmissionTime =
					new Date(matchingSubmission.createdAt).getTime() +
					SUBMISSION_BUFFER_IN_MILLISECONDS;
				const currentTime = Date.now();
				const tooFarInThePast = latestSubmissionTime < currentTime;
				if (tooFarInThePast) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
						.send({ error: `game with id (${gameId}) already finished` });
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
						error: `game with id (${gameId}) has a game from user with id (${userId})`
					});
				}

				const uniquePlayerSubmissions = new Set([
					...(matchingGame.playerSubmissions ?? []),
					submissionId
				]);

				matchingGame.playerSubmissions = Array.from(uniquePlayerSubmissions);

				const updatedGame = await matchingGame.save();

				return reply
					.status(httpResponseCodes.SUCCESSFUL.CREATED)
					.send(updatedGame);
			} catch (error) {
				request.log.error({ err: error }, "Error saving submission");

				if (isValidationError(error)) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
						.send({ error: "Validation failed", details: error.errors });
				}
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to create submission" });
			}
		}
	);
}
