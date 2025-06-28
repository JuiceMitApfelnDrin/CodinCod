import User from "@/models/user/user.js";
import { FastifyInstance } from "fastify";
import { httpResponseCodes, isUsername } from "types";
import { ParamsUsername } from "../types.js";
import {
	genericReturnMessages,
	userProperties
} from "@/config/generic-return-messages.js";

export default async function userByUsernameIsAvailableRoutes(
	fastify: FastifyInstance
) {
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
			const existingUser = await User.findOne({ username });

			if (existingUser) {
				return reply.status(200).send({ isAvailable: false });
			}

			return reply.status(200).send({ isAvailable: true });
		} catch (error) {
			reply.status(500).send({ message: "Internal Server Error" });
		}
	});
}
