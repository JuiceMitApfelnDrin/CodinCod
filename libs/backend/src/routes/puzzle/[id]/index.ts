import { FastifyInstance } from "fastify";
import {
	AuthenticatedInfo,
	PuzzleVisibilityEnum,
	isAuthor,
	isAuthenticatedInfo,
	ErrorResponse,
	httpResponseCodes,
	editPuzzleRequestSchema,
	PistonExecutionRequest,
	CodeExecutionParams
} from "types";
import Puzzle from "@/models/puzzle/puzzle.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import { ParamsId } from "@/types/types.js";
import { handleError } from "@/errors/handle-error.js";
import { PuzzleService } from "@/services/puzzle-service.js";
import { ExecutionService } from "@/services/execution-service.js";

export default async function puzzleByIdRoutes(fastify: FastifyInstance) {
	fastify.get<ParamsId>("/", async (request, reply) => {
		const { id } = request.params;

		try {
			const puzzle = await Puzzle.findById(id).populate("author");

			if (!puzzle) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
					.send({ error: "Puzzle not found" });
			}

			return reply.send(puzzle);
		} catch (error) {
			handleError(error, reply);
		}
	});

	fastify.put<ParamsId>(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			const user = request.user;

			if (!isAuthenticatedInfo(user)) {
				const errorResponse: ErrorResponse = {
					error: "Missing credentials",
					message: "You need to be logged in."
				};

				return reply.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED).send(errorResponse);
			}

			const { id } = request.params;
			const parseResult = editPuzzleRequestSchema.safeParse(request.body);

			if (!parseResult.success) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
					.send({ error: parseResult.error.errors });
			}

			const userId = user.userId;

			try {
				const puzzle = await PuzzleService.updatePuzzle(id, userId, parseResult.data);

				// if (puzzle.visibility === PuzzleVisibilityEnum.DRAFT) {
				// }

				return reply.send(puzzle);
			} catch (error) {
				handleError(error, reply);
			}
		}
	);

	fastify.delete<ParamsId>(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			const { id } = request.params;

			const user: AuthenticatedInfo = request.user as AuthenticatedInfo;
			const userId = user.userId;

			try {
				const puzzle = await Puzzle.findById(id);

				if (!puzzle) {
					const error: ErrorResponse = {
						error: "Puzzle not found",
						message: `Couldn't find puzzle with id (${id})`
					};

					return reply.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND).send(error);
				}

				const isAuthorOfPuzzle = isAuthor(puzzle.author.toString(), userId);
				const isNotAuthorOfPuzzle = !isAuthorOfPuzzle;

				if (isNotAuthorOfPuzzle) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.FORBIDDEN)
						.send({ error: "Not authorized to delete this puzzle" });
				}

				const isDraft = puzzle.visibility === PuzzleVisibilityEnum.DRAFT;
				const isNotDraft = !isDraft;
				if (isNotDraft) {
					// TODO: figure out: this is a questionable choice at the moment, but might not want to delete an interesting puzzle completely which users already have solved, so maybe archive instead of a full delete??
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.FORBIDDEN)
						.send({ error: "This puzzle was public, contact support to get it deleted." });
				}

				await puzzle.deleteOne();

				return reply.status(httpResponseCodes.SUCCESSFUL.NO_CONTENT).send();
			} catch (error) {
				handleError(error, reply);
			}
		}
	);
}
