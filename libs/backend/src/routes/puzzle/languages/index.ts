import { FastifyInstance } from "fastify";
import {
	arePistonRuntimes,
	httpResponseCodes,
	getLanguagesSuccessResponseSchema,
	puzzleErrorResponseSchema,
	type GetLanguagesSuccessResponse,
	type PuzzleErrorResponse
} from "types";
import {
	handleAndSendError,
	sendServiceUnavailableError
} from "@/helpers/error.helpers.js";

export default async function puzzleLanguagesRoutes(fastify: FastifyInstance) {
	fastify.get<{
		Reply: GetLanguagesSuccessResponse | PuzzleErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Get available programming languages for puzzles",
				tags: ["Puzzles"],
				response: {
					[httpResponseCodes.SUCCESSFUL.OK]: getLanguagesSuccessResponseSchema,
					[httpResponseCodes.SERVER_ERROR.SERVICE_UNAVAILABLE]: puzzleErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: puzzleErrorResponseSchema
				}
			}
		},
		async (request, reply) => {
		try {
			const runtimes = await fastify.runtimes();

			if (!arePistonRuntimes(runtimes)) {
				return sendServiceUnavailableError(
					reply,
					"Piston service is currently unavailable",
					"Unable to retrieve supported languages"
				);
			}

			const languages = runtimes.map((runtime) => ({
				name: runtime.language,
				version: runtime.version,
				aliases: runtime.aliases
			}));

			const sortedLanguages = languages.toSorted((a, b) => a.name.localeCompare(b.name));

			const response: GetLanguagesSuccessResponse = {
				languages: sortedLanguages
			};

			return reply.status(httpResponseCodes.SUCCESSFUL.OK).send(response);
		} catch (error) {
			return handleAndSendError(reply, error, request.url);
		}
	});
}
