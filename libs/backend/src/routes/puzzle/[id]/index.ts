import { FastifyInstance } from "fastify";
import {
	AuthenticatedInfo,
	puzzleEntitySchema,
	puzzleVisibilityEnum,
	isAuthor,
	isAuthenticatedInfo,
	PuzzleVisibility,
	isPuzzleDto,
	PUZZLE_CONFIG,
	isModerator,
	getPuzzleSuccessResponseSchema,
	updatePuzzleSuccessResponseSchema,
	puzzleErrorResponseSchema,
	idParamSchema,
	emptyResponseSchema,
	type GetPuzzleSuccessResponse,
	type UpdatePuzzleSuccessResponse,
	type PuzzleErrorResponse,
	httpResponseCodes
} from "types";
import Puzzle from "@/models/puzzle/puzzle.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import { checkAllValidators } from "@/utils/functions/check-all-validators.js";
import { findPuzzleById } from "@/helpers/puzzle.helpers.js";
import { findUserById } from "@/helpers/user.helpers.js";
import {
	handleAndSendError,
	sendUnauthorizedError,
	sendForbiddenError,
	sendNotFoundError
} from "@/helpers/error.helpers.js";

export default async function puzzleByIdRoutes(fastify: FastifyInstance) {
	fastify.get<{
		Params: { id: string };
		Reply: GetPuzzleSuccessResponse | PuzzleErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Get a specific puzzle by ID",
				tags: ["Puzzles"],
				params: idParamSchema,
				response: {
					[httpResponseCodes.SUCCESSFUL.OK]: getPuzzleSuccessResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.BAD_REQUEST]: puzzleErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.NOT_FOUND]: puzzleErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: puzzleErrorResponseSchema
				}
			}
		},
		async (request, reply) => {
		const { id } = request.params;

		const puzzle = await findPuzzleById(id, reply, request.url);

		if (!puzzle) return; // Error already handled

		try {
			const populatedPuzzle = await Puzzle.findById(id)
				.populate("author")
				.populate("comments")
				.populate({
					path: "comments",
					populate: {
						path: "author"
					}
				});

			if (!populatedPuzzle) {
				return sendNotFoundError(reply, "Puzzle not found");
			}

			if (!isPuzzleDto(populatedPuzzle)) {
				return sendNotFoundError(reply, "Puzzle not found");
			}

			return reply.send(populatedPuzzle);
		} catch (error) {
			return handleAndSendError(reply, error, request.url);
		}
	});

	fastify.put<{
		Params: { id: string };
		Body: any;
		Reply: UpdatePuzzleSuccessResponse | PuzzleErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Update a specific puzzle",
				tags: ["Puzzles"],
				security: [{ bearerAuth: [] }],
				params: idParamSchema,
				body: puzzleEntitySchema.omit({ author: true, createdAt: true, updatedAt: true }),
				response: {
					[httpResponseCodes.SUCCESSFUL.OK]: updatePuzzleSuccessResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.BAD_REQUEST]: puzzleErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED]: puzzleErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.FORBIDDEN]: puzzleErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.NOT_FOUND]: puzzleErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: puzzleErrorResponseSchema
				}
			},
			preHandler: [authenticated]
		},
		async (request, reply) => {
			const { id } = request.params;
			const parseResult = puzzleEntitySchema
				.omit({ author: true })
				.safeParse(request.body);

			if (!parseResult.success) {
				return handleAndSendError(reply, parseResult.error, request.url);
			}

			const user = request.user;

			if (!isAuthenticatedInfo(user)) {
				return sendUnauthorizedError(
					reply,
					"Missing credentials",
					"You need to be logged in"
				);
			}

			const userId = user.userId;

			const puzzle = await findPuzzleById(id, reply, request.url);
			if (!puzzle) return; // Error already handled

			const currentUser = await findUserById(userId, reply, request.url);
			if (!currentUser) return; // Error already handled

			if (
				!isAuthor(puzzle.author.toString(), userId) ||
				!isModerator(currentUser?.roles)
			) {
				return sendForbiddenError(reply, "Not authorized to edit this puzzle");
			}

			try {
				Object.assign(puzzle, parseResult.data);
				await puzzle.save();

				const checkWhenEdited: PuzzleVisibility[] = [
					puzzleVisibilityEnum.DRAFT,
					puzzleVisibilityEnum.READY,
					puzzleVisibilityEnum.REVIEW
				];

				if (
					checkWhenEdited.includes(puzzle.visibility) &&
					puzzle.validators &&
					puzzle.validators.length >=
						PUZZLE_CONFIG.requiredNumberOfValidators &&
					isPuzzleDto(puzzle)
				) {
					try {
						const allPassed = await checkAllValidators(puzzle, fastify);

						if (allPassed) {
							puzzle.visibility = puzzleVisibilityEnum.READY;
						} else {
							puzzle.visibility = puzzleVisibilityEnum.DRAFT;
						}

						await puzzle.save();
					} catch (error) {
						request.log.error(error, "Failed to check validators");
					}
				}

				if (!isPuzzleDto(puzzle)) {
					return sendNotFoundError(reply, "Puzzle not found");
				}

				const updateResponse: UpdatePuzzleSuccessResponse = {
					title: puzzle.title,
					statement: puzzle.statement || "",
					constraints: puzzle.constraints || "",
					author: puzzle.author?.toString() || "",
					validators: puzzle.validators || [],
					difficulty: puzzle.difficulty,
					visibility: puzzle.visibility,
					createdAt: puzzle.createdAt instanceof Date ? puzzle.createdAt.toISOString() : puzzle.createdAt || "",
					updatedAt: puzzle.updatedAt instanceof Date ? puzzle.updatedAt.toISOString() : puzzle.updatedAt || "",
					tags: puzzle.tags || [],
					comments: (puzzle.comments || []).map((comment: any) => 
						comment._id?.toString() || comment?.toString() || ""
					),
					solution: {
						code: "",
						language: "",
						languageVersion: ""
					}
				};

				return reply.send(updateResponse);
			} catch (error) {
				return handleAndSendError(reply, error, request.url);
			}
		}
	);

	fastify.delete<{
		Params: { id: string };
		Reply: PuzzleErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Delete a specific puzzle",
				tags: ["Puzzles"],
				security: [{ bearerAuth: [] }],
				params: idParamSchema,
				response: {
					[httpResponseCodes.SUCCESSFUL.NO_CONTENT]: emptyResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.BAD_REQUEST]: puzzleErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED]: puzzleErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.FORBIDDEN]: puzzleErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.NOT_FOUND]: puzzleErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: puzzleErrorResponseSchema
				}
			},
			preHandler: [authenticated]
		},
		async (request, reply) => {
			const { id } = request.params;

			const user: AuthenticatedInfo = request.user as AuthenticatedInfo;
			const userId = user.userId;

			const puzzle = await findPuzzleById(id, reply, request.url);
			if (!puzzle) return; // Error already handled

			const isAuthorOfPuzzle = isAuthor(puzzle.author.toString(), userId);
			if (!isAuthorOfPuzzle) {
				return sendForbiddenError(
					reply,
					"Not authorized to delete this puzzle"
				);
			}

			const allowedToRemoveState: PuzzleVisibility[] = [
				puzzleVisibilityEnum.DRAFT,
				puzzleVisibilityEnum.READY
			];

			const isDraft = allowedToRemoveState.includes(puzzle.visibility);
			if (!isDraft) {
				return sendForbiddenError(
					reply,
					"This puzzle was public, contact support to get it deleted"
				);
			}

			try {
				await puzzle.deleteOne();
				return reply.status(204).send();
			} catch (error) {
				return handleAndSendError(reply, error, request.url);
			}
		}
	);
}
