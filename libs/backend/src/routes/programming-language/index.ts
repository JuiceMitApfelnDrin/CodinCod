import { FastifyInstance } from "fastify";
import {
	httpResponseCodes,
	ProgrammingLanguageDto,
	programmingLanguageDtoSchema,
	arePistonRuntimes
} from "types";
import ProgrammingLanguage from "../../models/programming-language/language.js";

export default async function programmingLanguageRoutes(
	fastify: FastifyInstance
) {
	fastify.get("/", async (_, reply) => {
		try {
			// Get available runtimes from Piston
			const runtimes = await fastify.runtimes();
			
			if (!arePistonRuntimes(runtimes)) {
				fastify.log.error("Failed to fetch Piston runtimes");
				return reply
					.status(httpResponseCodes.SERVER_ERROR.SERVICE_UNAVAILABLE)
					.send({ error: "Code execution service is unavailable" });
			}

			// Create a set of available language+version combinations
			const availableLanguages = new Set(
				runtimes.map(runtime => `${runtime.language}:${runtime.version}`)
			);

			// Fetch all programming languages from database
			const allLanguages = await ProgrammingLanguage.find()
				.select("-createdAt -updatedAt -__v")
				.sort({ language: 1, version: -1 })
				.lean();

			// Filter to only include languages that are available in Piston
			const installedLanguages = allLanguages.filter(lang => 
				availableLanguages.has(`${lang.language}:${lang.version}`)
			);

			const dtos: ProgrammingLanguageDto[] = installedLanguages.map((lang) =>
				programmingLanguageDtoSchema.parse({
					_id: lang._id.toString(),
					language: lang.language,
					version: lang.version,
					aliases: lang.aliases,
					runtime: lang.runtime
				})
			);

			return reply.status(httpResponseCodes.SUCCESSFUL.OK).send({
				languages: dtos
			});
		} catch (error) {
			fastify.log.error(error);
			return reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send({ error: "Failed to fetch programming languages" });
		}
	});
}
