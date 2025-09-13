import { FastifyInstance } from "fastify";
import {
	validateUsername,
	findUserByUsername
} from "@/helpers/user.helpers.js";
import {
	getUserSuccessResponseSchema,
	userErrorResponseSchema,
	usernameParamSchema,
	type GetUserSuccessResponse,
	type UserErrorResponse,
	httpResponseCodes
} from "types";

export default async function userByUsernameRoutes(fastify: FastifyInstance) {
	fastify.get<{
		Params: { username: string };
		Reply: GetUserSuccessResponse | UserErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Get user profile by username",
				tags: ["Users"],
				params: usernameParamSchema,
				response: {
					[httpResponseCodes.SUCCESSFUL.OK]: getUserSuccessResponseSchema,
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

		const userResponse: GetUserSuccessResponse = {
			_id: (user._id as any)?.toString() || "",
			username: user.username,
			profile: user.profile,
			createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt
		};

		return reply.status(httpResponseCodes.SUCCESSFUL.OK).send(userResponse);
	});
}
