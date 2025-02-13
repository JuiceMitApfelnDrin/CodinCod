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
import Game from "@/models/game/game.js";
import Submission from "@/models/submission/submission.js";

export default async function submissionGameRoutes(fastify: FastifyInstance) {
	fastify.post<{ Body: GameSubmissionParams }>("/", async (request, reply) => {
		// unpacking body
		const { gameId, submissionId, userId } = request.body;

		try {
			const matchingSubmission = await Submission.findById<SubmissionEntity>(submissionId).exec();

			if (!matchingSubmission || matchingSubmission.user.toString() !== userId) {
				return reply.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND).send({
					error: `couldn't find a submission with id (${submissionId}) belonging to user with id (${userId})`
				});
			}

			const matchingGame = await Game.findById(gameId).populate("playerSubmissions").exec();

			if (!matchingGame) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
					.send({ error: `couldn't find a game with id (${gameId})` });
			}

			const latestSubmissionTime =
				new Date(matchingSubmission.createdAt).getTime() + SUBMISSION_BUFFER_IN_MILLISECONDS;
			const currentTime = new Date().getTime();

			const tooFarInThePast = latestSubmissionTime < currentTime;
			if (tooFarInThePast) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
					.send({ error: `game with id (${gameId}) already finished` });
			}

			const gameHasExistingUserSubmission = matchingGame.playerSubmissions.find((submission) => {
				if (isString(submission)) {
					return false;
				}

				return isAuthor(getUserIdFromUser(submission.user), userId);
			});

			if (gameHasExistingUserSubmission) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
					.send({ error: `game with id (${gameId}) has a game from user with id (${userId})` });
			}

			const uniquePlayerSubmissions = new Set([
				...(matchingGame.playerSubmissions ?? []),
				submissionId
			]);

			matchingGame.playerSubmissions = Array.from(uniquePlayerSubmissions);

			const updatedGame = await matchingGame.save();

			return reply.status(httpResponseCodes.SUCCESSFUL.CREATED).send(updatedGame);
		} catch (error) {
			request.log.error("Error saving submission:", error);

			if (isValidationError(error)) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
					.send({ error: "Validation failed", details: error.errors });
			}

			return reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send({ error: "Failed to create submission" });
		}
	});
}
