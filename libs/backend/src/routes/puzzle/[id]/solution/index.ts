import { FastifyInstance } from "fastify";
import {
	ErrorResponse,
	getUserIdFromUser,
	httpResponseCodes,
	isAuthenticatedInfo,
	isAuthor,
	isModerator
} from "types";
import { ParamsId } from "@/types/types.js";
import Puzzle from "@/models/puzzle/puzzle.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import checkUserBan from "@/plugins/middleware/check-user-ban.js";
import User from "@/models/user/user.js";

export default async function puzzleByIdSolutionRoutes(
	fastify: FastifyInstance
) {
	fastify.get<ParamsId>(
		"/",
		{
			onRequest: [authenticated, checkUserBan]
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
					.populate("author")
					.populate("solution.programmingLanguage")
					.lean();

				if (!puzzle) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
						.send({ error: "Puzzle not found" });
				}

				const user = await User.findById(userId);

				const authorIdString = getUserIdFromUser(puzzle.author);
				const isAuthorCheck =
					authorIdString !== null && isAuthor(authorIdString, userId);

				const lacksRequiredPermissions =
					!isAuthorCheck && !isModerator(user?.role);

				if (lacksRequiredPermissions) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.FORBIDDEN)
						.send({ error: "Not authorized" });
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
