import { FastifyInstance } from "fastify";
import { arePistonRuntimes, ErrorResponse, httpResponseCodes, PuzzleLanguage } from "types";

export default async function puzzleLanguagesRoutes(fastify: FastifyInstance) {
	fastify.get("/", async (_, reply) => {
		try {
			const runtimes = await fastify.runtimes();

			if (!arePistonRuntimes(runtimes)) {
				const error: ErrorResponse = runtimes;

				return reply.status(httpResponseCodes.SERVER_ERROR.SERVICE_UNAVAILABLE).send(error);
			}

			const languages: PuzzleLanguage[] = runtimes.map((runtime) => {
				return runtime.language;
			});

			return reply.status(httpResponseCodes.SUCCESSFUL.OK).send({
				languages: languages.sort()
			});
		} catch (error) {
			const errorResponse: ErrorResponse = {
				error: "Failed to fetch languages",
				message: "" + error
			};

			return reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send(errorResponse);
		}
	});
}
