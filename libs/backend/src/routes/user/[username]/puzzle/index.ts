import Puzzle from "@/models/puzzle/puzzle.js";
import { FastifyInstance } from "fastify";
import {
	DEFAULT_PAGE,
	isAuthenticatedInfo,
	isUsername,
	paginatedQuerySchema,
	puzzleVisibilityEnum,
	getUserPuzzlesSuccessResponseSchema,
	userErrorResponseSchema,
	usernameParamSchema,
	type GetUserPuzzlesSuccessResponse,
	type UserErrorResponse,
	httpResponseCodes
} from "types";
import decodeToken from "@/plugins/middleware/decode-token.js";
import {
	handleAndSendError,
	sendValidationError
} from "@/helpers/error.helpers.js";
import { findUserByUsername } from "@/helpers/user.helpers.js";

export default async function userByUsernamePuzzleRoutes(
	fastify: FastifyInstance
) {
	fastify.get<{
		Params: { username: string };
		Querystring: { page?: number; pageSize?: number };
		Reply: GetUserPuzzlesSuccessResponse | UserErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Get puzzles created by a specific user",
				tags: ["Users", "Puzzles"],
				params: usernameParamSchema,
				querystring: paginatedQuerySchema,
				response: {
					[httpResponseCodes.SUCCESSFUL.OK]: getUserPuzzlesSuccessResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.BAD_REQUEST]: userErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.NOT_FOUND]: userErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: userErrorResponseSchema
				}
			},
			onRequest: decodeToken
		},
		async (request, reply) => {
			const { username } = request.params;

			if (!isUsername(username)) {
				return sendValidationError(reply, "Username format is invalid");
			}

			const parseResult = paginatedQuerySchema.safeParse(request.query);
			if (!parseResult.success) {
				return handleAndSendError(reply, parseResult.error, request.url);
			}

			const user = await findUserByUsername(username, reply, request.url);
			if (!user) return; // Error already handled

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

			try {
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

				// Transform puzzles to the expected format
				const puzzleData = puzzles.map(puzzle => ({
					id: puzzle._id?.toString() || "",
					title: puzzle.title,
					difficulty: puzzle.difficulty,
					createdAt: puzzle.createdAt instanceof Date ? puzzle.createdAt.toISOString() : puzzle.createdAt || "",
					visibility: puzzle.visibility
				}));

				const paginatedResponse: GetUserPuzzlesSuccessResponse = {
					page,
					pageSize,
					totalPages,
					totalItems: total,
					items: [], // Required by schema but empty for backwards compatibility
					data: puzzleData
				};

				return reply.send(paginatedResponse);
			} catch (error) {
				return handleAndSendError(reply, error, request.url);
			}
		}
	);
}
