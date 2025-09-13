import Puzzle from "@/models/puzzle/puzzle.js";
import Submission from "@/models/submission/submission.js";
import { FastifyInstance } from "fastify";
import {
	getUserActivitySuccessResponseSchema,
	userErrorResponseSchema,
	usernameParamSchema,
	puzzleVisibilityEnum,
	type GetUserActivitySuccessResponse,
	type UserErrorResponse,
	httpResponseCodes
} from "types";
import {
	validateUsername,
	findUserByUsername
} from "@/helpers/user.helpers.js";
import { handleAndSendError } from "@/helpers/error.helpers.js";

export default async function userByUsernameActivityRoutes(
	fastify: FastifyInstance
) {
	fastify.get<{
		Params: { username: string };
		Reply: GetUserActivitySuccessResponse | UserErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Get user's activity including puzzles created and submissions",
				tags: ["Users"],
				params: usernameParamSchema,
				response: {
					[httpResponseCodes.SUCCESSFUL.OK]: getUserActivitySuccessResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.BAD_REQUEST]: userErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.NOT_FOUND]: userErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: userErrorResponseSchema
				}
			}
		},
		async (request, reply) => {
		const { username } = request.params;

		if (!validateUsername(username, reply, request.url)) {
			return;
		}

		const user = await findUserByUsername(username, reply, request.url);
		if (!user) {
			return;
		}

		try {
			const userId = user._id;

			const [puzzlesByUser, submissionsByUser] = await Promise.all([
				Puzzle.find({
					author: userId,
					visibility: puzzleVisibilityEnum.APPROVED
				}),
				Submission.find({ user: userId })
			]);

			// Transform to the expected activity format
			const puzzleActivities = puzzlesByUser.map(puzzle => ({
				type: "puzzle_created",
				timestamp: puzzle.createdAt instanceof Date ? puzzle.createdAt.toISOString() : puzzle.createdAt || "",
				details: {
					puzzleId: puzzle._id?.toString() || "",
					title: puzzle.title,
					difficulty: puzzle.difficulty
				}
			}));

			const submissionActivities = submissionsByUser.map(submission => ({
				type: "submission_created", 
				timestamp: submission.createdAt instanceof Date ? submission.createdAt.toISOString() : submission.createdAt || "",
				details: {
					submissionId: submission._id?.toString() || "",
					puzzleId: submission.puzzle?.toString() || "",
					language: submission.language
				}
			}));

			const activityResponse: GetUserActivitySuccessResponse = {
				data: {
					"puzzles": puzzleActivities,
					"submissions": submissionActivities
				}
			};

			return reply.status(httpResponseCodes.SUCCESSFUL.OK).send(activityResponse);
		} catch (error) {
			return handleAndSendError(reply, error, request.url);
		}
	});
}
