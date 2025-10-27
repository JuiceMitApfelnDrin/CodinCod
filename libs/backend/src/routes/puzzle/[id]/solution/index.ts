import { FastifyInstance } from "fastify";
import {
	environment,
	ErrorResponse,
	getUserIdFromUser,
	httpResponseCodes,
	isAuthenticatedInfo,
	isAuthor,
	isModerator,
	isUserDto
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

			if (process.env.NODE_ENV === environment.DEVELOPMENT) {
				request.log.info({
					route: "puzzleByIdSolution",
					action: "start",
					puzzleId: id,
					hasUser: !!user,
					isAuthenticated: isAuthenticatedInfo(user)
				});
			}

			if (!isAuthenticatedInfo(user)) {
				if (process.env.NODE_ENV === environment.DEVELOPMENT) {
					request.log.warn({
						route: "puzzleByIdSolution",
						action: "unauthorized",
						puzzleId: id,
						user
					});
				}
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

				if (process.env.NODE_ENV === environment.DEVELOPMENT) {
					request.log.info({
						route: "puzzleByIdSolution",
						action: "puzzle_fetched",
						puzzleId: id,
						hasAuthor: !!puzzle?.author,
						authorType: typeof puzzle?.author,
						authorIsObject: puzzle?.author && typeof puzzle.author === 'object',
						hasSolution: !!puzzle?.solution,
						authorData: puzzle?.author ? JSON.stringify(puzzle.author) : null,
						authorKeys: puzzle?.author && typeof puzzle.author === 'object' ? Object.keys(puzzle.author) : null
					});
				}

				if (!puzzle) {
					if (process.env.NODE_ENV === environment.DEVELOPMENT) {
						request.log.warn({
							route: "puzzleByIdSolution",
							action: "puzzle_not_found",
							puzzleId: id
						});
					}
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
						.send({ error: "Puzzle not found" });
				}

				const user = await User.findById(userId);

				if (process.env.NODE_ENV === environment.DEVELOPMENT) {
					const isAuthorUserDto = isUserDto(puzzle.author);
					
					request.log.info({
						route: "puzzleByIdSolution",
						action: "detailed_author_check",
						puzzleId: id,
						authorDto: puzzle.author ? JSON.stringify(puzzle.author) : null,
						authorDtoKeys: puzzle.author && typeof puzzle.author === 'object' ? Object.keys(puzzle.author) : null,
						isUserDtoResult: isAuthorUserDto,
						authorId: isAuthorUserDto && typeof puzzle.author === 'object' && '_id' in puzzle.author 
							? String(puzzle.author._id)
							: null,
						authorIdType: isAuthorUserDto && typeof puzzle.author === 'object' && '_id' in puzzle.author 
							? typeof puzzle.author._id
							: null,
						userId: userId,
						userIdType: typeof userId
					});
				}

				const authorIdString = getUserIdFromUser(puzzle.author);
				const isAuthorCheck = authorIdString !== null && isAuthor(authorIdString, userId);
				
				if (process.env.NODE_ENV === environment.DEVELOPMENT) {
					request.log.info({
						route: "puzzleByIdSolution",
						action: "isAuthor_function_check",
						puzzleId: id,
						isUserDtoPass: isUserDto(puzzle.author),
						authorIdString: authorIdString,
						authorIdStringLength: authorIdString?.length,
						userId: userId,
						userIdLength: userId?.length,
						isAuthorResult: isAuthorCheck,
						areEqual: authorIdString === userId,
						// Check character by character
						charComparison: authorIdString && userId ? {
							author: authorIdString.split('').map((c, i) => `${i}:${c}(${c.charCodeAt(0)})`).join(','),
							user: userId.split('').map((c, i) => `${i}:${c}(${c.charCodeAt(0)})`).join(',')
						} : null
					});
				}

				const lacksRequiredPermissions =
					!isAuthorCheck &&
					!isModerator(user?.role);

				if (process.env.NODE_ENV === environment.DEVELOPMENT) {
					request.log.info({
						route: "puzzleByIdSolution",
						action: "authorization_check",
						puzzleId: id,
						userId,
						authorId: authorIdString,
						isAuthor: isAuthorCheck,
						isModerator: isModerator(user?.role),
						lacksPermissions: lacksRequiredPermissions
					});
				}

				if (lacksRequiredPermissions) {
					if (process.env.NODE_ENV === environment.DEVELOPMENT) {
						request.log.warn({
							route: "puzzleByIdSolution",
							action: "forbidden",
							puzzleId: id,
							userId
						});
					}
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.FORBIDDEN)
						.send({ error: "Not authorized" });
				}

				if (process.env.NODE_ENV === environment.DEVELOPMENT) {
					request.log.info({
						route: "puzzleByIdSolution",
						action: "success",
						puzzleId: id,
						userId,
						hasSolution: !!puzzle.solution,
						solutionCode: puzzle.solution?.code?.substring(0, 50),
						solutionProgrammingLanguage: puzzle.solution?.programmingLanguage
					});
				}

				return reply.send(puzzle);
			} catch (error) {
				if (process.env.NODE_ENV === environment.DEVELOPMENT) {
					request.log.error({
						route: "puzzleByIdSolution",
						action: "error",
						puzzleId: id,
						error: error instanceof Error ? error.message : "Unknown error"
					});
				}
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to fetch puzzle" });
			}
		}
	);
}
