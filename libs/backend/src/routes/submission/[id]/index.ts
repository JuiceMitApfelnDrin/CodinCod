import Submission from "@/models/submission/submission.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import { FastifyInstance } from "fastify";
import {
	getSubmissionSuccessResponseSchema,
	submissionErrorResponseSchema,
	idParamSchema,
	type GetSubmissionSuccessResponse,
	type SubmissionErrorResponse,
	httpResponseCodes,
	isSubmissionDto
} from "types";
import {
	sendNotFoundError,
	handleAndSendError
} from "@/helpers/error.helpers.js";

export default async function submissionByIdRoutes(fastify: FastifyInstance) {
	fastify.get<{
		Params: { id: string };
		Reply: GetSubmissionSuccessResponse | SubmissionErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Get a specific submission by ID",
				tags: ["Submissions"],
				security: [{ bearerAuth: [] }],
				params: idParamSchema,
				response: {
					[httpResponseCodes.SUCCESSFUL.OK]: getSubmissionSuccessResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED]: submissionErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.NOT_FOUND]: submissionErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: submissionErrorResponseSchema
				}
			},
			preHandler: [authenticated]
		},
		async (request, reply) => {
			const { id } = request.params;

			try {
				const submission = await Submission.findById(id).select("+code");

				if (!submission) {
					return sendNotFoundError(
						reply,
						"Submission not found",
						"submission",
						request.url
					);
				}

				if (!isSubmissionDto(submission)) {
					return sendNotFoundError(
						reply,
						"Submission not found",
						"submission",
						request.url
					);
				}

				return reply.send(submission);
			} catch (error) {
				return handleAndSendError(reply, error, request.url);
			}
		}
	);
}
