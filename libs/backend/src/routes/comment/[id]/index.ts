import Comment from "@/models/comment/comment.js";
import { ParamsId } from "@/types/types.js";
import { FastifyInstance } from "fastify";
import { httpResponseCodes, objectIdSchema } from "types";

export default async function commentByIdRoutes(fastify: FastifyInstance) {
	fastify.get<ParamsId>("/", async (request, reply) => {
		const parseResult = objectIdSchema.safeParse(request.params.id);

		if (!parseResult.success) {
			return reply
				.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
				.send({ error: parseResult.error.errors });
		}

		try {
			const comment = await Comment.findById(request.params.id).populate("comments");

			if (!comment) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
					.send({ error: "Comment not found" });
			}

			return reply.status(httpResponseCodes.SUCCESSFUL.OK).send(comment);
		} catch (error) {
			return reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send({ error: "Failed to fetch comment" });
		}
	});
}
