import { FastifyInstance } from "fastify";
import {
	ErrorResponse,
	httpResponseCodes,
	isAuthenticatedInfo,
	isAuthor,
	isModerator,
	isUserDto
} from "types";
import { ParamsId } from "@/types/types.js";
import Puzzle from "@/models/puzzle/puzzle.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import User from "@/models/user/user.js";

export default async function puzzleByIdSolutionRoutes(
	fastify: FastifyInstance
) {
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

				return reply
					.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
					.send(errorResponse);
			}

			const userId = user.userId;

			try {
				const puzzle = await Puzzle.findById(id)
					.select("+solution")
					.populate("author");

				if (!puzzle) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
						.send({ error: "Puzzle not found" });
				}

				const user = await User.findById(userId);

				const hasRequiredPermissions =
					isUserDto(puzzle.author) &&
					!isAuthor(puzzle.author._id.toString(), userId) &&
					!isModerator(user?.role);

				if (hasRequiredPermissions) {
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
