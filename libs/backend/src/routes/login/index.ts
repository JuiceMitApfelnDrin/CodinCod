import { FastifyInstance } from "fastify";
import bcrypt from "bcryptjs";
import User from "../../models/user/user.js";
import { generateToken } from "../../utils/functions/generate-token.js";
import {
	AuthenticatedInfo,
	cookieKeys,
	environment,
	ERROR_MESSAGES,
	getCookieOptions,
	httpResponseCodes,
	isEmail,
	loginSchema
} from "types";

export default async function loginRoutes(fastify: FastifyInstance) {
	fastify.post(
		"/",
		{
			config: {
				rateLimit: {
					max: 5,
					timeWindow: "1 minute"
				}
			}
		},
		async (request, reply) => {
			const parseResult = loginSchema.safeParse(request.body);

			if (!parseResult.success) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
					.send({ message: ERROR_MESSAGES.FORM.VALIDATION_ERRORS });
			}

			const { identifier, password } = parseResult.data;

			try {
				const user = isEmail(identifier)
					? await User.findOne({ email: identifier }).select("+password")
					: await User.findOne({ username: identifier })
							.select("+password")
							.exec();

				if (!user) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
						.send({ message: ERROR_MESSAGES.AUTHENTICATION.INVALID_CREDENTIALS });
				}
				const isMatch = await bcrypt.compare(password, user.password);

				if (!isMatch) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.UNAUTHORIZED)
						.send({ message: ERROR_MESSAGES.AUTHENTICATION.INVALID_CREDENTIALS });
				}

				const authenticatedUserInfo: AuthenticatedInfo = {
					userId: String(user._id),
					username: user.username,
					role: user.role,
					isAuthenticated: true
				};
				const token = generateToken(fastify, authenticatedUserInfo);
				const maxAge = 7 * 24 * 60 * 60;
				const isProduction = process.env.NODE_ENV === environment.PRODUCTION;

				const cookieOptions = getCookieOptions({
					isProduction,
					...(process.env.FRONTEND_HOST && {
						frontendHost: process.env.FRONTEND_HOST
					}),
					maxAge
				});

				return reply
					.status(httpResponseCodes.SUCCESSFUL.OK)
					.setCookie(cookieKeys.TOKEN, token, cookieOptions)
					.send({ message: "Login successful" });
			} catch (error) {
				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ message: error });
			}
		}
	);
}
