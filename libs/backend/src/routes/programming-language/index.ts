import { FastifyInstance } from "fastify";
import {
	httpResponseCodes,
	ProgrammingLanguageDto,
	programmingLanguageDtoSchema
} from "types";
import ProgrammingLanguage from "../../models/programming-language/language.js";

export default async function programmingLanguageRoutes(
	fastify: FastifyInstance
) {
	fastify.get("/", async (_, reply) => {
		try {
			const languages = await ProgrammingLanguage.find()
				.select("-createdAt -updatedAt -__v")
				.sort({ language: 1, version: -1 })
				.lean();

			const dtos: ProgrammingLanguageDto[] = languages.map((lang) =>
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
