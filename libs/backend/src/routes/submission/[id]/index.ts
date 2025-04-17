import Submission from "@/models/submission/submission.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import { ParamsId } from "@/types/types.js";
import { FastifyInstance } from "fastify";
import { ErrorResponse, httpResponseCodes } from "types";

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
					const errorResponse: ErrorResponse = {
						error: "Submission not found",
						message: "Couldn't find submission"
					};

					return reply.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST).send(errorResponse);
				}

				return reply.send(submission);
			} catch (error) {
				const errorResponse: ErrorResponse = {
					error: "Failed to fetch submission",
					message: "" + error
				};

				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send(errorResponse);
			}
		}
	);
}
