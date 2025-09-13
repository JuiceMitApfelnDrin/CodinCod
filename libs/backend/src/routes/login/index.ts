import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import User, { UserDocument } from "../../models/user/user.js";
import {
	isEmail,
	loginRequestSchema,
	type LoginRequest,
	type LoginSuccessResponse,
	type LoginErrorResponse,
	AuthenticatedInfo,
	loginSuccessResponseSchema,
	loginErrorResponseSchema,
	httpResponseCodes
} from "types";
import {
	formatZodIssues,
	handleAndSendError,
	sendUnauthorizedError,
	sendValidationError
} from "../../helpers/error.helpers.js";
import { createAuthResponse } from "../../helpers/auth.helpers.js";

export default async function loginRoutes(fastify: FastifyInstance) {
	fastify.post<{
		Body: LoginRequest;
		Reply: LoginSuccessResponse | LoginErrorResponse;
	}>(
		"/",
		{
			schema: {
				description: "Login with identifier (email/username) and password",
				tags: ["Authentication"],
				body: loginRequestSchema,
				response: {
					[httpResponseCodes.SUCCESSFUL.OK]: loginSuccessResponseSchema,
					[httpResponseCodes.CLIENT_ERROR.BAD_REQUEST]: loginErrorResponseSchema,
					[httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR]: loginErrorResponseSchema
				}
			}
		},
		async (request, reply) => {
			const parseResult = loginRequestSchema.safeParse(request.body);

			if (!parseResult.success) {
				return sendValidationError(
					reply,
					"",
					formatZodIssues(parseResult.error),
					request.url
				);
			}

			const { identifier, password } = parseResult.data;

			try {
				const user: UserDocument = isEmail(identifier)
					? await User.findOne({ email: identifier }).select("+password")
					: await User.findOne({ username: identifier })
							.select("+password")
							.exec();

				if (!user) {
					return sendUnauthorizedError(
						reply,
						"Invalid email/username or password",
						request.url
					);
				}

				const isMatch = await bcrypt.compare(password, user.password);

				if (!isMatch) {
					return sendUnauthorizedError(
						reply,
						"Invalid email/username or password",
						request.url
					);
				}

				const authenticatedUserInfo: AuthenticatedInfo = {
					userId: `${user._id}`,
					username: user.username,
					isAuthenticated: true
				};

				return createAuthResponse(
					fastify,
					reply,
					authenticatedUserInfo,
					"Login successful"
				);
			} catch (error) {
				return handleAndSendError(reply, error, request.url);
			}
		}
	);
}
