import { FastifyInstance } from "fastify";
import { PuzzleLanguage } from "types";

export default async function puzzleLanguagesRoutes(fastify: FastifyInstance) {
	fastify.get("/", async (_, reply) => {
		const runtimes = await fastify.runtimes();

		const languages: PuzzleLanguage[] = runtimes.map((runtime) => {
			return runtime.language;
		});

		return reply.status(200).send({
			languages
		});
	});
}
