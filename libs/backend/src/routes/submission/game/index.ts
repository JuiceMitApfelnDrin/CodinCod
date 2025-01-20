import { FastifyInstance } from "fastify";
import { isAuthenticatedInfo, SUBMISSION_BUFFER_IN_MILLISECONDS, SubmissionEntity } from "types";
import authenticated from "../../../plugins/middleware/authenticated.js";
import { isValidationError } from "../../../utils/functions/is-validation-error.js";
import Game from "@/models/game/game.js";
import Submission from "@/models/submission/submission.js";

export default async function submissionGameRoutes(fastify: FastifyInstance) {
	fastify.post<{ Body: { gameId: string; submissionId: string } }>(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			/**
			 * todo, have this checking credentials on multiple places, make this easier somehow :)
			 */
			if (!isAuthenticatedInfo(request.user)) {
				return reply.status(401).send({ error: "Not right credentials" });
			}

			const user = request.user;
			const userId = user.userId;

			// unpacking body
			const { gameId, submissionId } = request.body;

			try {
				const matchingSubmission = await Submission.findById<SubmissionEntity>(submissionId).exec();

				if (!matchingSubmission || matchingSubmission.userId.toString() !== userId) {
					return reply.status(404).send({
						error: `couldn't find a submission with id (${submissionId}) belonging to user with id (${userId})`
					});
				}

				const matchingGame = await Game.findById(gameId).populate("playerSubmissions").exec();

				if (!matchingGame) {
					return reply.status(404).send({ error: `couldn't find a game with id (${gameId})` });
				}

				const latestSubmissionTime =
					new Date(matchingSubmission.createdAt).getTime() + SUBMISSION_BUFFER_IN_MILLISECONDS;
				const currentTime = new Date().getTime();

				const tooFarInThePast = latestSubmissionTime < currentTime;
				if (tooFarInThePast) {
					return reply.status(404).send({ error: `game with id (${gameId}) already finished` });
				}

				const uniquePlayerSubmissions = new Set([
					...(matchingGame.playerSubmissions ?? []),
					submissionId
				]);

				matchingGame.playerSubmissions = Array.from(uniquePlayerSubmissions);

				const updatedGame = await matchingGame.save();

				return reply.status(201).send(updatedGame);
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
