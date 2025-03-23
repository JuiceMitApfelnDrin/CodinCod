import User from "@/models/user/user.js";
import authenticated from "@/plugins/middleware/authenticated.js";
import { FastifyInstance } from "fastify";
import { httpResponseCodes, isAuthenticatedInfo, userProfileSchema } from "types";

export default async function profileRoutes(fastify: FastifyInstance) {
	fastify.get("/", { onRequest: authenticated }, async (request, reply) => {
		if (!isAuthenticatedInfo(request.user)) {
			return reply.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED).send({ error: "No auth" });
		}

		const userId = request.user.userId;

		try {
			const user = await User.findById(userId);

			if (!user || !user.profile) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
					.send({ error: "Profile not found" });
			}
			return reply.send(user.profile);
		} catch (error) {
			return reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send({ error: "Fetch fail" });
		}
	});

	fastify.put("/", { onRequest: authenticated }, async (request, reply) => {
		if (!isAuthenticatedInfo(request.user)) {
			return reply.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED).send({ error: "No auth" });
		}

		const parsed = userProfileSchema.safeParse(request.body);

		if (!parsed.success) {
			return reply
				.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
				.send({ error: parsed.error.errors });
		}

		const userId = request.user.userId;

		try {
			const user = await User.findById(userId);

			if (!user) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
					.send({ error: "User not found" });
			}
			user.profile = { ...parsed.data };

			await user.save();

			return reply.send(user.profile);
		} catch (error) {
			return reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send({ error: "Update fail" });
		}
	});

	fastify.patch("/", { onRequest: authenticated }, async (request, reply) => {
		const parsed = userProfileSchema.partial().safeParse(request.body);

		if (!parsed.success) {
			return reply
				.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
				.send({ error: parsed.error.errors });
		}

		if (!isAuthenticatedInfo(request.user)) {
			return reply.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED).send({ error: "No auth" });
		}

		const userId = request.user.userId;

		try {
			const user = await User.findById(userId);

			if (!user) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
					.send({ error: "User not found" });
			}
			user.profile = { ...(user.profile || {}), ...parsed.data };

			await user.save();

			return reply.send(user.profile);
		} catch (error) {
			return reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send({ error: "Patch fail" });
		}
	});

	fastify.delete("/", { onRequest: authenticated }, async (request, reply) => {
		if (!isAuthenticatedInfo(request.user)) {
			return reply.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED).send({ error: "No auth" });
		}

		const userId = request.user.userId;

		try {
			const user = await User.findById(userId);

			if (!user) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
					.send({ error: "User not found" });
			}

			if (!user.profile) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
					.send({ error: "Profile not found" });
			}

			user.profile = undefined;

			await user.save();

			return reply.status(httpResponseCodes.SUCCESSFUL.NO_CONTENT).send();
		} catch (error) {
			return reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send({ error: "Delete fail" });
		}
	});
}
