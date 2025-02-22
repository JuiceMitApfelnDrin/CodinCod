import Submission from "@/models/submission/submission.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import { ParamsId } from "@/types/types.js";
import { FastifyInstance } from "fastify";
import { httpResponseCodes } from "types";

export default async function submissionByIdRoutes(fastify: FastifyInstance) {
	fastify.get<ParamsId>(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			const { id } = request.params;

			try {
				const submission = await Submission.findById(id).select("+code");

				if (!submission) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
						.send({ error: "Submission not found" });
				}

				return reply.send(submission);
			} catch (error) {
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to fetch submission" });
			}
		}
	);
}
