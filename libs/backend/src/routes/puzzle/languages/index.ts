import { FastifyInstance } from "fastify";
import { arePistonRuntimes, ErrorResponse, httpResponseCodes, PuzzleLanguage } from "types";

export default async function puzzleLanguagesRoutes(fastify: FastifyInstance) {
	fastify.get("/", async (_, reply) => {
		const runtimes = await fastify.runtimes();

		if (!arePistonRuntimes(runtimes)) {
			const error: ErrorResponse = runtimes;

			return reply.status(httpResponseCodes.SERVER_ERROR.SERVICE_UNAVAILABLE).send(error);
		}

		const languages: PuzzleLanguage[] = runtimes.map((runtime) => {
			return runtime.language;
		});

		return reply.status(200).send({
			languages
		});
	});
}
