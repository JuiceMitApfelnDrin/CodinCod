import { FastifyInstance } from "fastify";
import authenticated from "../../../plugins/middelware/authenticated.js";
import { validatorEntitySchema } from "types";
import Validator from "../../../models/puzzle/validator.js";

type ParamsId = { Params: { id: string } };

export default async function validatorDetailRoutes(fastify: FastifyInstance) {
	fastify.get<ParamsId>(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			const { id } = request.params;

			try {
				const validator = await Validator.findById(id);

				if (!validator) {
					return reply.status(404).send({ error: "Validator not found" });
				}

				return reply.send(validator);
			} catch (error) {
				return reply.status(500).send({ error: "Failed to fetch validator" });
			}
		}
	);

	fastify.put<ParamsId>(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			const { id } = request.params;
			const parseResult = validatorEntitySchema.safeParse(request.body);

			if (!parseResult.success) {
				return reply.status(400).send({ error: parseResult.error.errors });
			}

			try {
				const validator = await Validator.findById(id);

				if (!validator) {
					return reply.status(404).send({ error: "Validator not found" });
				}

				Object.assign(validator, parseResult.data);
				await validator.save();

				return reply.send(validator);
			} catch (error) {
				return reply.status(500).send({ error: "Failed to update validator" });
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

			try {
				const validator = await Validator.findById(id);

				if (!validator) {
					return reply.status(404).send({ error: "Validator not found" });
				}

				await validator.deleteOne();

				return reply.status(204).send();
			} catch (error) {
				return reply.status(500).send({ error: "Failed to delete validator" });
			}
		}
	);
}
