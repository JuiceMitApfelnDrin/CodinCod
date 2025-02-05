import { FastifyInstance } from "fastify";
import {
	DEFAULT_PAGE,
	PaginatedQueryResponse,
	paginatedQuerySchema,
	isAuthenticatedInfo,
	createPuzzleSchema
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
				return reply.status(401).send({ error: "Not right credentials" });
			}

			const user = request.user;
			const userId = user.userId;

			const puzzleData = {
				...parseResult.data,
				authorId: userId
			};

			try {
				const puzzle = new Puzzle(puzzleData);
				await puzzle.save();

				return reply.status(201).send(puzzle);
			} catch (error) {
				return reply.status(500).send({ error: "Failed to create puzzle" });
			}
		}
	);

	fastify.get("/", async (request, reply) => {
		const parseResult = paginatedQuerySchema.safeParse(request.query);

		if (!parseResult.success) {
			return reply.status(400).send({ error: parseResult.error.errors });
		}

		const query = parseResult.data;
		const { page, pageSize } = query;

		try {
			// Calculate pagination offsets
			const offsetSkip = (page - DEFAULT_PAGE) * pageSize;

			// Fetch puzzles from the database with pagination
			const [puzzles, total] = await Promise.all([
				Puzzle.find().skip(offsetSkip).limit(pageSize).exec(),
				Puzzle.countDocuments()
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
			return reply.status(500).send({ error: "Failed to fetch puzzles" });
		}
	});
}
