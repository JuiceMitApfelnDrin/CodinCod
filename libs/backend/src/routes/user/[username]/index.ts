import User from "@/models/user/user.js";
import { FastifyInstance } from "fastify";
import { httpResponseCodes, isUsername } from "types";
import { ParamsUsername } from "./types.js";
import { genericReturnMessages, userProperties } from "@/config/generic-return-messages.js";
import { USER } from "@/utils/constants/model.js";

export default async function userByUsernameRoutes(fastify: FastifyInstance) {
	fastify.get<ParamsUsername>("/", async (request, reply) => {
		const { username } = request.params;

		if (!isUsername(username)) {
			const { BAD_REQUEST } = httpResponseCodes.CLIENT_ERROR;
			const { IS_INVALID } = genericReturnMessages[BAD_REQUEST];
			const { USERNAME } = userProperties;

			return reply.status(BAD_REQUEST).send({
				message: `${USERNAME} ${IS_INVALID}`
			});
		}

		try {
			const user = await User.findOne({ username });

			if (!user) {
				const { NOT_FOUND } = httpResponseCodes.CLIENT_ERROR;
				const { COULD_NOT_BE_FOUND } = genericReturnMessages[NOT_FOUND];

				return reply.status(NOT_FOUND).send({
					message: `${USER} ${COULD_NOT_BE_FOUND}`
				});
			}

			const { OK } = httpResponseCodes.SUCCESSFUL;
			const { WAS_FOUND } = genericReturnMessages[OK];

			return reply.status(OK).send({
				user,
				message: `${USER} ${WAS_FOUND}`
			});
		} catch (error) {
			const { INTERNAL_SERVER_ERROR } = httpResponseCodes.SERVER_ERROR;
			const { WENT_WRONG } = genericReturnMessages[INTERNAL_SERVER_ERROR];
			const { USERNAME } = userProperties;

			return reply.status(INTERNAL_SERVER_ERROR).send({
				message: `attempting to find a ${USER} by ${USERNAME} ${WENT_WRONG}`
			});
		}
	});
}
