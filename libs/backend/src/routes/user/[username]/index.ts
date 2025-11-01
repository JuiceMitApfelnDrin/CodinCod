import User from "@/models/user/user.js";
import { FastifyInstance } from "fastify";
import { ERROR_MESSAGES, httpResponseCodes, UserAPI } from "types";
import { ParamsUsername } from "./types.js";

export default async function userByUsernameRoutes(fastify: FastifyInstance) {
	fastify.get<ParamsUsername>("/", async (request, reply) => {
		const { username } = request.params;

		const parseResult = UserAPI.getUserByUsernameRequestSchema.safeParse(
			request.params
		);

		if (!parseResult.success) {
			return reply
				.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
				.send({ error: parseResult.error.issues });
		}

		try {
			const user = await User.findOne({ username }).lean();

			if (!user) {
				return reply.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND).send({
					error: "User not found",
					message: `User with username '${username}' could not be found`
				});
			}

			const response = {
				message: "User found",
				user: {
					...user,
					_id: user._id.toString()
				}
			};

			return reply.status(httpResponseCodes.SUCCESSFUL.OK).send(response);
		} catch (error) {
			return reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send({
					error: ERROR_MESSAGES.SERVER.INTERNAL_ERROR,
					message: ERROR_MESSAGES.GENERIC.SOMETHING_WENT_WRONG
				});
		}
	});
}
