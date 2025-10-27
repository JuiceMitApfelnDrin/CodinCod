import { FastifyInstance } from "fastify";
import {
	AuthenticatedInfo,
	puzzleEntitySchema,
	puzzleVisibilityEnum,
	isAuthor,
	isAuthenticatedInfo,
	DeletePuzzle,
	ErrorResponse,
	httpResponseCodes,
	PuzzleVisibility,
	isPuzzleDto,
	PUZZLE_CONFIG,
	isModerator
} from "types";
import Puzzle from "@/models/puzzle/puzzle.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import checkUserBan from "@/plugins/middleware/check-user-ban.js";
import { ParamsId } from "@/types/types.js";
import { checkAllValidators } from "@/utils/functions/check-all-validators.js";
import User from "@/models/user/user.js";

export default async function puzzleByIdRoutes(fastify: FastifyInstance) {
	fastify.get<ParamsId>("/", async (request, reply) => {
		const { id } = request.params;

		try {
			const puzzle = await Puzzle.findById(id)
				.populate("author")
				.populate("comments")
				.populate({
					path: "comments",
					populate: {
						path: "author"
					}
				});

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
			onRequest: [authenticated, checkUserBan]
		},
		async (request, reply) => {
			const { id } = request.params;
			const parseResult = puzzleEntitySchema
				.omit({ author: true })
				.safeParse(request.body);

			if (!parseResult.success) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
					.send({ error: parseResult.error.issues });
			}

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
			const puzzle = await Puzzle.findById(id).lean();

			if (!puzzle) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
					.send({ error: "Puzzle not found" });
			}

			const user = await User.findById(userId);

			// Convert author ObjectId to string for comparison
			const authorIdString = puzzle.author ? String(puzzle.author) : null;
			const isAuthorCheck = authorIdString !== null && isAuthor(authorIdString, userId);

			if (
				!isAuthorCheck &&
				!isModerator(user?.role)
			) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.FORBIDDEN)
					.send({ error: "Not authorized to edit this puzzle" });
			}				if (
					parseResult.data.visibility === puzzleVisibilityEnum.APPROVED &&
					!isModerator(user?.role)
				) {
					return reply.status(httpResponseCodes.CLIENT_ERROR.FORBIDDEN).send({
						error: "Only moderators can approve puzzles",
						message:
							"You cannot set your own puzzle to approved status. Submit it for review instead."
					});
				}

			// Since puzzle is a lean object, we need to use findByIdAndUpdate
			const updatedPuzzle = await Puzzle.findByIdAndUpdate(
				id,
				parseResult.data,
				{ new: true }
			);

			const checkWhenEdited: PuzzleVisibility[] = [
				puzzleVisibilityEnum.DRAFT,
				puzzleVisibilityEnum.READY,
				puzzleVisibilityEnum.REVIEW
			];

			if (
				updatedPuzzle &&
				checkWhenEdited.includes(updatedPuzzle.visibility) &&
				updatedPuzzle.validators &&
				updatedPuzzle.validators.length >=
					PUZZLE_CONFIG.requiredNumberOfValidators &&
				isPuzzleDto(updatedPuzzle)
			) {
				try {
					const allPassed = await checkAllValidators(updatedPuzzle, fastify);

					if (allPassed) {
						updatedPuzzle.visibility = puzzleVisibilityEnum.READY;
					} else {
						updatedPuzzle.visibility = puzzleVisibilityEnum.DRAFT;
					}

					await updatedPuzzle.save();
				} catch (error) {
					request.log.error(error, "Failed to check validators");
				}
			}

			return reply.send(updatedPuzzle);
			} catch (error) {
				const errorResponse: ErrorResponse = {
					error: "Failed to update puzzle",
					message: ""
				};

				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send(errorResponse);
			}
		}
	);

	fastify.delete<{ Params: DeletePuzzle }>(
		"/",
		{
			onRequest: [authenticated, checkUserBan]
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

					return reply
						.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
						.send(error);
				}

				const isAuthorOfPuzzle = isAuthor(puzzle.author.toString(), userId);
				const isNotAuthorOfPuzzle = !isAuthorOfPuzzle;

				if (isNotAuthorOfPuzzle) {
					return reply
						.status(403)
						.send({ error: "Not authorized to delete this puzzle" });
				}

				const allowedToRemoveState: PuzzleVisibility[] = [
					puzzleVisibilityEnum.DRAFT,
					puzzleVisibilityEnum.READY
				];

				const isDraft = allowedToRemoveState.includes(puzzle.visibility);
				const isNotDraft = !isDraft;
				if (isNotDraft) {
					// TODO: figure out: this is a questionable choice at the moment, but might not want to delete an interesting puzzle completely which users already have solved, so maybe archive instead of a full delete??
					return reply.status(403).send({
						error: "This puzzle was public, contact support to get it deleted."
					});
				}

				await puzzle.deleteOne();

				return reply.status(204).send();
			} catch (error) {
				return reply.status(500).send({ error: "Failed to delete puzzle" });
			}
		}
	);
}
