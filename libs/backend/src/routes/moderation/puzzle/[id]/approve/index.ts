import { FastifyInstance } from "fastify";
import {
	httpResponseCodes,
	puzzleVisibilityEnum,
	approvePuzzleSchema
} from "types";
import moderatorOnly from "../../../../../plugins/middleware/moderator-only.js";
import Puzzle from "../../../../../models/puzzle/puzzle.js";
import { ParamsId } from "../../../../../types/types.js";

export default async function moderationPuzzleByIdApproveRoutes(
	fastify: FastifyInstance
) {
	fastify.post<ParamsId>(
		"/",
		{
			onRequest: moderatorOnly
		},
		async (request, reply) => {
			const { id } = request.params;

			const parseResult = approvePuzzleSchema.safeParse(request.body);
			if (!parseResult.success) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
					.send({ error: parseResult.error.issues });
			}

			try {
				const puzzle = await Puzzle.findById(id);

				if (!puzzle) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
						.send({ error: "Puzzle not found" });
				}

				// Update puzzle to approved status
				puzzle.visibility = puzzleVisibilityEnum.APPROVED;
				puzzle.updatedAt = new Date();
				await puzzle.save();

				return reply.send({
					message: "Puzzle approved successfully",
					puzzle
				});
			} catch (error) {
				fastify.log.error(error, "Failed to approve puzzle");
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to approve puzzle" });
			}
		}
	);

}
