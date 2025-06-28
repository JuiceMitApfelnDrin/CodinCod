import Puzzle from "@/models/puzzle/puzzle.js";
import User from "@/models/user/user.js";
import { FastifyInstance } from "fastify";
import {
	DEFAULT_PAGE,
	httpResponseCodes,
	isAuthenticatedInfo,
	isUsername,
	PaginatedQueryResponse,
	paginatedQuerySchema,
	puzzleVisibilityEnum
} from "types";
import { ParamsUsername } from "../types.js";
import {
	genericReturnMessages,
	userProperties
} from "@/config/generic-return-messages.js";
import decodeToken from "@/plugins/middleware/decode-token.js";

export default async function userByUsernamePuzzleRoutes(
	fastify: FastifyInstance
) {
	fastify.get<ParamsUsername>(
		"/",
		{
			onRequest: decodeToken
		},
		async (request, reply) => {
			const { username } = request.params;

			if (!isUsername(username)) {
				return reply.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST).send({
					message: `${userProperties.USERNAME} ${
						genericReturnMessages[httpResponseCodes.CLIENT_ERROR.BAD_REQUEST]
							.IS_INVALID
					}`
				});
			}

			const parseResult = paginatedQuerySchema.safeParse(request.query);

			if (!parseResult.success) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
					.send({ error: parseResult.error.errors });
			}

			try {
				const user = await User.findOne({ username });

				if (!user) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
						.send({ message: "User not found" });
				}

				const userId = user._id;

				const query = parseResult.data;
				const { page, pageSize } = query;

				// Calculate pagination offsets
				const offsetSkip = (page - DEFAULT_PAGE) * pageSize;

				const queryCondition: Record<string, any> = { author: userId };

				// If the user is authenticated and is the owner or contributor, fetch all puzzles
				if (
					isAuthenticatedInfo(request.user) &&
					request.user.username === user.username
				) {
					// No additional condition needed for visibility
				} else {
					// Otherwise, only fetch approved puzzles
					queryCondition.visibility = puzzleVisibilityEnum.APPROVED;
				}

				const [puzzles, total] = await Promise.all([
					Puzzle.find(queryCondition)
						.populate("author")
						.skip(offsetSkip)
						.limit(pageSize)
						.exec(),
					Puzzle.countDocuments(queryCondition)
				]);

				// Calculate total pages
				const totalPages = Math.ceil(total / pageSize);

				const paginatedResponse: PaginatedQueryResponse = {
					page,
					pageSize,
					totalPages,
					totalItems: total,
					items: puzzles
				};

				return reply.send(paginatedResponse);
			} catch (error) {
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: `Failed to fetch puzzles of user (${username})` });
			}
		}
	);
}
