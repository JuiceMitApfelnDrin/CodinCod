import { FastifyInstance } from "fastify";
import {
	AccountErrorResponse,
	GetPreferencesSuccessResponse,
	isAuthenticatedInfo,
	PatchPreferencesRequest,
	PatchPreferencesSuccessResponse,
	preferencesDtoSchema,
	UpdatePreferencesRequest,
	UpdatePreferencesSuccessResponse,
	getPreferencesSuccessResponseSchema,
	updatePreferencesRequestSchema,
	updatePreferencesSuccessResponseSchema,
	deletePreferencesSuccessResponseSchema,
	patchPreferencesRequestSchema,
	patchPreferencesSuccessResponseSchema,
	accountErrorResponseSchema,
	httpResponseCodes
} from "types";
import Preferences from "../../../models/preferences/preferences.js";
import authenticated from "../../../plugins/middleware/authenticated.js";
import {
	handleAndSendError,
	sendUnauthorizedError,
	sendNotFoundError
} from "../../../helpers/error.helpers.js";

export default async function preferencesRoutes(fastify: FastifyInstance) {
	fastify.get<{
		Reply: GetPreferencesSuccessResponse | AccountErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Get user account preferences",
				tags: ["Account"],
				security: [{ bearerAuth: [] }],
				response: {
					[httpResponseCodes.SUCCESSFUL.OK]: getPreferencesSuccessResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED]: accountErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.NOT_FOUND]: accountErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: accountErrorResponseSchema
				}
			},
			preHandler: [authenticated]
		},
		async (request, reply) => {
			if (!isAuthenticatedInfo(request.user)) {
				return sendUnauthorizedError(reply, "Invalid credentials");
			}

			const userId = request.user.userId;

			try {
				const preferences = await Preferences.findOne({ owner: userId });

				if (!preferences) {
					return sendNotFoundError(reply, "Preferences not found");
				}

				return reply.send(preferences);
			} catch (error) {
				return handleAndSendError(reply, error, request.url);
			}
		}
	);

	fastify.put<{
		Body: UpdatePreferencesRequest;
		Reply: UpdatePreferencesSuccessResponse | AccountErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Update user account preferences",
				tags: ["Account"],
				security: [{ bearerAuth: [] }],
				body: updatePreferencesRequestSchema,
				response: {
					[httpResponseCodes.SUCCESSFUL.OK]: updatePreferencesSuccessResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.BAD_REQUEST]: accountErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED]: accountErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: accountErrorResponseSchema
				}
			},
			preHandler: [authenticated]
		},
		async (request, reply) => {
			if (!isAuthenticatedInfo(request.user)) {
				return sendUnauthorizedError(reply, "Invalid credentials");
			}

			const parseResult = preferencesDtoSchema.safeParse(request.body);

			if (!parseResult.success) {
				return handleAndSendError(reply, parseResult.error, request.url);
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
				return handleAndSendError(reply, error, request.url);
			}
		}
	);

	fastify.delete<{
		Reply: void | AccountErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Delete user account preferences",
				tags: ["Account"],
				security: [{ bearerAuth: [] }],
				response: {
					[httpResponseCodes.SUCCESSFUL.NO_CONTENT]: deletePreferencesSuccessResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED]: accountErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.NOT_FOUND]: accountErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: accountErrorResponseSchema
				}
			},
			preHandler: [authenticated]
		},
		async (request, reply) => {
			if (!isAuthenticatedInfo(request.user)) {
				return sendUnauthorizedError(reply, "Invalid credentials");
			}

			const userId = request.user.userId;

			try {
				const deleted = await Preferences.findOneAndDelete({ owner: userId });

				if (!deleted) {
					return sendNotFoundError(reply, "Preferences not found");
				}

				return reply.status(204).send();
			} catch (error) {
				return handleAndSendError(reply, error, request.url);
			}
		}
	);

	fastify.patch<{
		Body: PatchPreferencesRequest;
		Reply: PatchPreferencesSuccessResponse | AccountErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Partially update user account preferences",
				tags: ["Account"],
				security: [{ bearerAuth: [] }],
				body: patchPreferencesRequestSchema,
				response: {
					[httpResponseCodes.SUCCESSFUL.OK]: patchPreferencesSuccessResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.BAD_REQUEST]: accountErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED]: accountErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: accountErrorResponseSchema
				}
			},
			preHandler: [authenticated]
		},
		async (request, reply) => {
			if (!isAuthenticatedInfo(request.user)) {
				return sendUnauthorizedError(reply, "Invalid credentials");
			}

			const parseResult = preferencesDtoSchema
				.partial()
				.safeParse(request.body);

			if (!parseResult.success) {
				return handleAndSendError(reply, parseResult.error, request.url);
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
				return handleAndSendError(reply, error, request.url);
			}
		}
	);
}
