import { FastifyInstance } from "fastify";
import {
	DEFAULT_PAGE,
	PaginatedQueryResponse,
	paginatedQuerySchema,
	isAuthenticatedInfo,
	createPuzzleSchema,
	httpResponseCodes,
	CreatePuzzleBackend,
	ErrorResponse
} from "types";
import Puzzle from "../../models/puzzle/puzzle.js";
import authenticated from "../../plugins/middleware/authenticated.js";

export default async function puzzleRoutes(fastify: FastifyInstance) {
	fastify.post(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			const parseResult = createPuzzleSchema.safeParse(request.body);

			if (!parseResult.success) {
				return reply.status(400).send({ error: parseResult.error.errors });
			}

			if (!isAuthenticatedInfo(request.user)) {
				return reply.status(401).send({ error: "Invalid credentials" });
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

				return reply.status(httpResponseCodes.SUCCESSFUL.CREATED).send(puzzle);
			} catch (error) {
				const errorResponse: ErrorResponse = {
					error: "Failed to create puzzle",
					message: "" + error
				};

				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send(errorResponse);
			}
		}
	);

	fastify.get("/", async (request, reply) => {
		const parseResult = paginatedQuerySchema.safeParse(request.query);

		if (!parseResult.success) {
			return reply
				.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
				.send({ error: parseResult.error.errors });
		}

		const query = parseResult.data;
		const { page, pageSize } = query;

		try {
			// Calculate pagination offsets
			const offsetSkip = (page - DEFAULT_PAGE) * pageSize;

			// Fetch puzzles from the database with pagination
			const [puzzles, total] = await Promise.all([
				Puzzle.find().populate("author").skip(offsetSkip).limit(pageSize).exec(),
				Puzzle.countDocuments()
			]);

			// Calculate total pages
			const totalPages = Math.ceil(total / pageSize);

			const paginatedResponse: PaginatedQueryResponse = {
				items: puzzles,
				page,
				pageSize,
				totalItems: total,
				totalPages
			};

			return reply.status(httpResponseCodes.SUCCESSFUL.OK).send(paginatedResponse);
		} catch (error) {
			const errorResponse: ErrorResponse = {
				error: "Failed to fetch puzzles",
				message: "" + error
			};

			return reply.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(errorResponse);
		}
	});
}
