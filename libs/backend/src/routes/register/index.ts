import { FastifyInstance } from "fastify";
import User from "../../models/user/user.js";
import {
	registerRequestSchema,
	registerSuccessResponseSchema,
	registerErrorResponseSchema,
	type RegisterRequest,
	type RegisterSuccessResponse,
	type RegisterErrorResponse,
	httpResponseCodes
} from "types";
import {
	handleAndSendError,
	sendConflictError
} from "../../helpers/error.helpers.js";
import { createAuthResponse } from "../../helpers/auth.helpers.js";

export default async function registerRoutes(fastify: FastifyInstance) {
	fastify.post<{
		Body: RegisterRequest;
		Reply: RegisterSuccessResponse | RegisterErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Register a new user account",
				tags: ["Authentication"],
				body: registerRequestSchema,
				response: {
					[httpResponseCodes.SUCCESSFUL.CREATED]: registerSuccessResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.BAD_REQUEST]:
						registerErrorResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.CONFLICT]:
						registerErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]:
						registerErrorResponseSchema
				}
			}
		},
		async (request, reply) => {
			const parseResult = registerRequestSchema.safeParse(request.body);

			if (!parseResult.success) {
				return handleAndSendError(reply, parseResult.error, request.url);
			}

			const { email, password, username } = parseResult.data;

			try {
				// Check if username already exists
				const existingUserByUsername = await User.findOne({ username });
				if (existingUserByUsername) {
					return sendConflictError(
						reply,
						"Username already exists",
						"Please choose a different username",
						request.url
					);
				}

				// Check if email already exists
				const existingUserByEmail = await User.findOne({ email });
				if (existingUserByEmail) {
					return sendConflictError(
						reply,
						"Email already exists",
						"Please use a different email address",
						request.url
					);
				}

				// Create a new user
				const user = new User({ email, password, username });
				await user.save();

				const authenticatedUserInfo = {
					userId: (user._id as any)?.toString() || "",
					username: user.username,
					isAuthenticated: true
				};

				return createAuthResponse(
					fastify,
					reply,
					authenticatedUserInfo,
					"User registered successfully"
				);
			} catch (error) {
				return handleAndSendError(reply, error, request.url);
			}
		}
	);
}
