import { FastifyInstance } from "fastify";
import { isAuthenticatedInfo, isAuthor, isModerator, isUserDto } from "types";
import { ParamsId } from "@/types/types.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import Puzzle from "@/models/puzzle/puzzle.js";
import {
	handleAndSendError,
	sendUnauthorizedError,
	sendNotFoundError,
	sendForbiddenError
} from "@/helpers/error.helpers.js";
import { findUserById } from "@/helpers/user.helpers.js";

export default async function puzzleByIdSolutionRoutes(
	fastify: FastifyInstance
) {
	fastify.get<{
		Params: ParamsId;
	}>(
		"/",
		{
			preHandler: [authenticated]
		},
		async (request, reply) => {
			const { id } = request.params;
			const user = request.user;

			if (!isAuthenticatedInfo(user)) {
				return sendUnauthorizedError(
					reply,
					"Missing credentials",
					"You need to be logged in"
				);
			}

			const userId = user.userId;

			try {
				const puzzle = await Puzzle.findById(id)
					.select("+solution")
					.populate("author");

				if (!puzzle) {
					return sendNotFoundError(reply, "Puzzle not found");
				}

				const currentUser = await findUserById(userId, reply, request.url);
				if (!currentUser) return; // Error already handled

				const hasRequiredPermissions =
					(isUserDto(puzzle.author) &&
						!isAuthor(puzzle.author._id.toString(), userId)) ||
					!isModerator(currentUser?.roles);

				if (hasRequiredPermissions) {
					return sendForbiddenError(
						reply,
						"Not authorized to edit this puzzle"
					);
				}

				return reply.send(puzzle);
			} catch (error) {
				return handleAndSendError(reply, error, request.url);
			}
		}
	);
}
