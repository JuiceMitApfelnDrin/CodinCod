import { FastifyInstance } from "fastify";
import {
	AuthenticatedInfo,
	puzzleEntitySchema,
	PuzzleVisibilityEnum,
	isAuthor,
	isAuthenticatedInfo,
	DeletePuzzle,
	ErrorResponse,
	httpResponseCodes
} from "types";
import Puzzle from "@/models/puzzle/puzzle.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import { ParamsId } from "@/types/types.js";

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
			return reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send({ error: "Failed to fetch puzzle" });
		}
	});

	fastify.put<ParamsId>(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			const { id } = request.params;
			const parseResult = puzzleEntitySchema.omit({ author: true }).safeParse(request.body);

			if (!parseResult.success) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
					.send({ error: parseResult.error.errors });
			}

			const user = request.user;

			if (!isAuthenticatedInfo(user)) {
				const errorResponse: ErrorResponse = {
					error: "Missing credentials",
					message: "You need to be logged in."
				};

				return reply.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED).send(errorResponse);
			}

			const userId = user.userId;

			try {
				const puzzle = await Puzzle.findById(id);

				if (!puzzle) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
						.send({ error: "Puzzle not found" });
				}

				// TODO: eventually make it so contributors / moderators can adjust puzzles
				if (!isAuthor(puzzle.author.toString(), userId)) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.FORBIDDEN)
						.send({ error: "Not authorized to edit this puzzle" });
				}
				Object.assign(puzzle, parseResult.data);

				await puzzle.save();

				return reply.send(puzzle);
			} catch (error) {
				const errorResponse: ErrorResponse = { error: "Failed to update puzzle", message: "" };

				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send(errorResponse);
			}
		}
	);

	fastify.delete<{ Params: DeletePuzzle }>(
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
					return reply.status(403).send({ error: "Not authorized to delete this puzzle" });
				}

				const isDraft = puzzle.visibility === PuzzleVisibilityEnum.DRAFT;
				const isNotDraft = !isDraft;
				if (isNotDraft) {
					// TODO: figure out: this is a questionable choice at the moment, but might not want to delete an interesting puzzle completely which users already have solved, so maybe archive instead of a full delete??
					return reply
						.status(403)
						.send({ error: "This puzzle was public, contact support to get it deleted." });
				}

				await puzzle.deleteOne();

				return reply.status(204).send();
			} catch (error) {
				return reply.status(500).send({ error: "Failed to delete puzzle" });
			}
		}
	);
}
