import { FastifyInstance } from "fastify";
import Puzzle from "../../../models/puzzle/puzzle.js";
import authenticated from "../../../plugins/middelware/authenticated.js";
import {
	AuthenticatedInfo,
	puzzleEntitySchema,
	PuzzleVisibilityEnum,
	isAuthor,
	isAuthenticatedInfo
} from "types";
import { ParamsId } from "./types.js";

export default async function puzzleByIdRoutes(fastify: FastifyInstance) {
	fastify.get<ParamsId>("/", async (request, reply) => {
		const { id } = request.params;

		try {
			const puzzle = await Puzzle.findById(id).populate("authorId");

			if (!puzzle) {
				return reply.status(404).send({ error: "Puzzle not found" });
			}

			return reply.send(puzzle);
		} catch (error) {
			return reply.status(500).send({ error: "Failed to fetch puzzle" });
		}
	});

	fastify.put<ParamsId>(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			const { id } = request.params;
			const parseResult = puzzleEntitySchema.omit({ authorId: true }).safeParse(request.body);

			if (!parseResult.success) {
				return reply.status(400).send({ error: parseResult.error.errors });
			}

			if (!isAuthenticatedInfo(request.user)) {
				return reply.status(401).send({ error: "Not right credentials" });
			}

			const user = request.user;
			const userId = user.userId;

			try {
				const puzzle = await Puzzle.findById(id);

				if (!puzzle) {
					return reply.status(404).send({ error: "Puzzle not found" });
				}

				if (puzzle.authorId.toString() !== userId) {
					return reply.status(403).send({ error: "Not authorized to edit this puzzle" });
				}
				Object.assign(puzzle, parseResult.data);
				await puzzle.save();

				return reply.send(puzzle);
			} catch (error) {
				return reply.status(500).send({ error: "Failed to update puzzle" });
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
				const noPuzzle = !puzzle;

				if (noPuzzle) {
					return reply.status(404).send({ error: "Puzzle not found" });
				}

				const isAuthorOfPuzzle = isAuthor(puzzle.authorId.toString(), userId);
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
