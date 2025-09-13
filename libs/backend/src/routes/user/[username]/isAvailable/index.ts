import User from "@/models/user/user.js";
import { FastifyInstance } from "fastify";
import { validateUsername } from "@/helpers/user.helpers.js";
import { handleAndSendError } from "@/helpers/error.helpers.js";
import {
	checkUsernameAvailabilitySuccessResponseSchema,
	userErrorResponseSchema,
	usernameParamSchema,
	type CheckUsernameAvailabilitySuccessResponse,
	type UserErrorResponse,
	httpResponseCodes
} from "types";

export default async function userByUsernameIsAvailableRoutes(
	fastify: FastifyInstance
) {
	fastify.get<{
		Params: { username: string };
		Reply: CheckUsernameAvailabilitySuccessResponse | UserErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Check if username is available for registration",
				tags: ["Users"],
				params: usernameParamSchema,
				response: {
					[httpResponseCodes.SUCCESSFUL.OK]: checkUsernameAvailabilitySuccessResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.BAD_REQUEST]: userErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: userErrorResponseSchema
				}
			}
		},
		async (request, reply) => {
		const { username } = request.params;

		if (!validateUsername(username, reply, request.url)) {
			return;
		}

		try {
			const existingUser = await User.findOne({ username });
			const response: CheckUsernameAvailabilitySuccessResponse = {
				available: !existingUser,
				message: existingUser ? "Username is already taken" : "Username is available"
			};
			return reply
				.status(httpResponseCodes.SUCCESSFUL.OK)
				.send(response);
		} catch (error) {
			return handleAndSendError(reply, error, request.url);
		}
	});
}
