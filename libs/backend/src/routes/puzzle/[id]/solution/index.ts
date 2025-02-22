import { FastifyInstance } from "fastify";
import { ErrorResponse, httpResponseCodes, isAuthenticatedInfo, isAuthor, isUserDto } from "types";
import { ParamsId } from "@/types/types.js";
import Puzzle from "@/models/puzzle/puzzle.js";
import authenticated from "@/plugins/middleware/authenticated.js";

export default async function puzzleByIdSolutionRoutes(fastify: FastifyInstance) {
	fastify.get<ParamsId>(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			const { id } = request.params;

			const user = request.user;

			if (!isAuthenticatedInfo(user)) {
				const errorResponse: ErrorResponse = {
					error: "Missing credentials",
					message: "You need to be logged in."
				};

				return reply.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED).send(errorResponse);
			}

			try {
				const puzzle = await Puzzle.findById(id).select("+solution").populate("author");

				if (!puzzle) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
						.send({ error: "Puzzle not found" });
				}

				// TODO: eventually make it so contributors / moderators can adjust puzzles
				if (isUserDto(puzzle.author) && !isAuthor(puzzle.author._id.toString(), user.userId)) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.FORBIDDEN)
						.send({ error: "Not authorized to edit this puzzle" });
				}

				return reply.send(puzzle);
			} catch (error) {
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to fetch puzzle" });
			}
		}
	);
}
