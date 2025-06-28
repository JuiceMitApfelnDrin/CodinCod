import { FastifyInstance } from "fastify";
import {
	httpResponseCodes,
	isAuthenticatedInfo,
	preferencesDtoSchema
} from "types";
import Preferences from "../../../models/preferences/preferences.js";
import authenticated from "../../../plugins/middleware/authenticated.js";

export default async function preferencesRoutes(fastify: FastifyInstance) {
	fastify.get(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			if (!isAuthenticatedInfo(request.user)) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
					.send({ error: "Invalid credentials" });
			}

			const userId = request.user.userId;

			try {
				const preferences = await Preferences.findOne({ owner: userId });

				if (!preferences) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
						.send({ error: "Preferences not found" });
				}

				return reply.send(preferences);
			} catch (error) {
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to fetch preferences" });
			}
		}
	);

	fastify.put(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			if (!isAuthenticatedInfo(request.user)) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
					.send({ error: "Invalid credentials" });
			}

			const parseResult = preferencesDtoSchema.safeParse(request.body);

			if (!parseResult.success) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
					.send({ error: parseResult.error.errors });
			}

			const userId = request.user.userId;

			try {
				const preferences = await Preferences.findOneAndUpdate(
					{ owner: userId },
					{ ...parseResult.data, owner: userId },
					{ new: true, runValidators: true, upsert: true }
				);

				return reply.send(preferences);
			} catch (error) {
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to update preferences" });
			}
		}
	);

	fastify.delete(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			if (!isAuthenticatedInfo(request.user)) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
					.send({ error: "Invalid credentials" });
			}

			const userId = request.user.userId;

			try {
				const deleted = await Preferences.findOneAndDelete({ owner: userId });

				if (!deleted) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
						.send({ error: "Preferences not found" });
				}

				return reply
					.status(httpResponseCodes.SUCCESSFUL.NO_CONTENT)
					.send(deleted);
			} catch (error) {
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to delete preferences" });
			}
		}
	);

	fastify.patch(
		"/",
		{
			onRequest: authenticated
		},
		async (request, reply) => {
			const parseResult = preferencesDtoSchema
				.partial()
				.safeParse(request.body);

			if (!parseResult.success) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
					.send({ error: parseResult.error.errors });
			}

			if (!isAuthenticatedInfo(request.user)) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
					.send({ error: "Invalid credentials" });
			}

			const userId = request.user.userId;

			try {
				const preferences = await Preferences.findOneAndUpdate(
					{ owner: userId },
					{ $set: parseResult.data },
					{ new: true, runValidators: true, upsert: true }
				);

				return reply.send(preferences);
			} catch (error) {
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ error: "Failed to update preferences" });
			}
		}
	);
}
