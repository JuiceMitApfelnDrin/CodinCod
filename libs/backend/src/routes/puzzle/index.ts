import { FastifyInstance } from "fastify";
import {
	type CreatePuzzleRequest,
	type CreatePuzzleSuccessResponse,
	type ListPuzzlesRequest,
	type ListPuzzlesSuccessResponse,
	type PuzzleErrorResponse,
	createPuzzleRequestSchema,
	createPuzzleSuccessResponseSchema,
	puzzleErrorResponseSchema,
	listPuzzlesRequestSchema,
	listPuzzlesSuccessResponseSchema,
	isAuthenticatedInfo,
	CreatePuzzleBackend,
	httpResponseCodes
} from "types";
import Puzzle from "../../models/puzzle/puzzle.js";
import authenticated from "../../plugins/middleware/authenticated.js";
import {
	formatZodIssues,
	handleAndSendError,
	sendUnauthorizedError,
	sendValidationError
} from "../../helpers/error.helpers.js";

export default async function puzzleRoutes(fastify: FastifyInstance) {
	// POST /puzzle - Create a new puzzle
	fastify.post<{
		Body: CreatePuzzleRequest;
		Reply: CreatePuzzleSuccessResponse | PuzzleErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Create a new puzzle",
				tags: ["Puzzles"],
				security: [{ bearerAuth: [] }],
				body: createPuzzleRequestSchema,
				response: {
					[httpResponseCodes.SUCCESSFUL.CREATED]: createPuzzleSuccessResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.BAD_REQUEST]: puzzleErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED]: puzzleErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: puzzleErrorResponseSchema
				}
			},
			preHandler: [authenticated]
		},
		async (request, reply) => {
			const parseResult = createPuzzleRequestSchema.safeParse(request.body);
			if (!parseResult.success) {
				return sendValidationError(
					reply,
					"Invalid puzzle data",
					formatZodIssues(parseResult.error),
					request.url
				);
			}

			if (!isAuthenticatedInfo(request.user)) {
				return sendUnauthorizedError(reply, "Invalid credentials");
			}

			const user = request.user;
			const userId = user.userId;

			const puzzleData: CreatePuzzleBackend = {
				...parseResult.data,
				author: userId
			};

			try {
				const puzzle = new Puzzle(puzzleData);
				await puzzle.save();

				// Convert to proper response format matching puzzleEntitySchema
				const response: CreatePuzzleSuccessResponse = {
					...puzzleData,
					createdAt: puzzle.createdAt || new Date().toISOString(),
					updatedAt: puzzle.updatedAt || new Date().toISOString(),
					// Include all required fields from puzzleEntitySchema
					statement: puzzle.statement || "",
					constraints: puzzle.constraints || "",
					validators: puzzle.validators || [],
					difficulty: puzzle.difficulty,
					visibility: puzzle.visibility,
					solution: {
						code: "",
						language: "javascript",
						languageVersion: "18.15.0"
					},
					tags: puzzle.tags || [],
					comments: puzzle.comments || []
				};

				return reply.status(201).send(response);
			} catch (error) {
				return handleAndSendError(reply, error, request.url);
			}
		}
	);

	// GET /puzzle - List puzzles with pagination
	fastify.get<{
		Querystring: ListPuzzlesRequest;
		Reply: ListPuzzlesSuccessResponse | PuzzleErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Get a paginated list of puzzles",
				tags: ["Puzzles"],
				querystring: listPuzzlesRequestSchema,
				response: {
					[httpResponseCodes.SUCCESSFUL.OK]: listPuzzlesSuccessResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.BAD_REQUEST]: puzzleErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: puzzleErrorResponseSchema
				}
			}
		},
		async (request, reply) => {
			const parseResult = listPuzzlesRequestSchema.safeParse(request.query);

			if (!parseResult.success) {
				return sendValidationError(
					reply,
					"Invalid query parameters",
					formatZodIssues(parseResult.error),
					request.url
				);
			}

			const query = parseResult.data;
			const { page = 1, pageSize = 10 } = query;

			try {
				// Calculate pagination offsets
				const offsetSkip = (page - 1) * pageSize;

				// Fetch puzzles from the database with pagination
				const [puzzles, total] = await Promise.all([
					Puzzle.find()
						.populate("author")
						.populate("comments")
						.skip(offsetSkip)
						.limit(pageSize)
						.exec(),
					Puzzle.countDocuments()
				]);

				const totalPages = Math.ceil(total / pageSize);

				const response: ListPuzzlesSuccessResponse = {
					page,
					pageSize,
					totalItems: total,
					totalPages,
					items: [],
					data: puzzles.map((puzzle) => ({
						_id: (puzzle._id as any)?.toString() || "",
						title: puzzle.title,
						statement: puzzle.statement,
						constraints: puzzle.constraints,
						difficulty: puzzle.difficulty,
						tags: puzzle.tags,
						visibility: puzzle.visibility,
						author:
							typeof puzzle.author === "object" && puzzle.author !== null
								? puzzle.author
								: (puzzle.author as any)?.toString() || "",
						validators: puzzle.validators,
						solution: puzzle.solution as any,
						createdAt: puzzle.createdAt,
						updatedAt: puzzle.updatedAt,
						comments: (puzzle.comments || []).map((comment: any) =>
							typeof comment === "object" && comment !== null && comment._id
								? comment._id?.toString() || ""
								: comment?.toString() || ""
						)
					}))
				};

				return reply.send(response);
			} catch (error) {
				return handleAndSendError(reply, error, request.url);
			}
		}
	);
}
