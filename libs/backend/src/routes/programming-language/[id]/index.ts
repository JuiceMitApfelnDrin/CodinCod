import { FastifyInstance } from "fastify";
import {
	httpResponseCodes,
	ProgrammingLanguageDto,
	programmingLanguageDtoSchema
} from "types";
import ProgrammingLanguage from "../../../models/programming-language/language.js";

export default async function programmingLanguageByIdRoutes(
	fastify: FastifyInstance
) {
	// GET programming language by ID
	fastify.get("/", async (request, reply) => {
		try {
			const { id } = request.params as { id: string };

			const language = await ProgrammingLanguage.findById(id)
				.select("-createdAt -updatedAt -__v")
				.lean();

			if (!language) {
				return reply.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND).send({
					error: "Programming language not found"
				});
			}

			const dto: ProgrammingLanguageDto = programmingLanguageDtoSchema.parse({
				_id: language._id.toString(),
				language: language.language,
				version: language.version,
				aliases: language.aliases,
				runtime: language.runtime
			});

			return reply.status(httpResponseCodes.SUCCESSFUL.OK).send(dto);
		} catch (error) {
			fastify.log.error(error);
			return reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send({ error: "Failed to fetch programming language" });
		}
	});
}
