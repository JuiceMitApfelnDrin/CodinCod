import { FastifyInstance } from "fastify";
import { PaginatedQueryResponse, paginatedQuerySchema, validatorEntitySchema } from "types";
import { $ref } from "../../config/schema.js";
import authenticated from "../../plugins/middelware/authenticated.js";
import Validator from "../../models/puzzle/validator.js";

export default async function validatorRoutes(fastify: FastifyInstance) {
	fastify.post(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			const parseResult = validatorEntitySchema.safeParse(request.body);

			if (!parseResult.success) {
				return reply.status(400).send({ error: parseResult.error.errors });
			}

			try {
				const validator = new Validator(parseResult.data);
				await validator.save();

				return reply.status(201).send(validator);
			} catch (error) {
				return reply.status(500).send({ error: "Failed to create validator" });
			}
		}
	);

	fastify.get(
		"/",
		{
			schema: {
				querystring: $ref("paginatedQuerySchema"),
				response: {
					200: $ref("paginatedQueryResponseSchema")
				}
			},
			onRequest: authenticated
		},
		async (request, reply) => {
			const parseResult = paginatedQuerySchema.safeParse(request.query);

			if (!parseResult.success) {
				return reply.status(400).send({ error: parseResult.error.errors });
			}

			const query = parseResult.data;
			const { page, pageSize } = query;

			try {
				const offsetSkip = (page - 1) * pageSize;

				const [validators, total] = await Promise.all([
					Validator.find().skip(offsetSkip).limit(pageSize).exec(),
					Validator.countDocuments()
				]);

				const totalPages = Math.ceil(total / pageSize);

				const paginatedResponse: PaginatedQueryResponse = {
					page,
					pageSize,
					totalPages,
					totalItems: total,
					items: validators
				};

				return reply.send(paginatedResponse);
			} catch (error) {
				return reply.status(500).send({ error: "Failed to fetch validators" });
			}
		}
	);
}
