import { FastifyInstance } from "fastify";
import { z } from "zod";
import { Error } from "mongoose";
import { MongoError } from "mongodb";
import User from "../../models/user/user.js";
import {
	cookieKeys,
	environment,
	ERROR_MESSAGES,
	getCookieOptions,
	httpResponseCodes,
	registerSchema
} from "types";
import { generateToken } from "../../utils/functions/generate-token.js";

export default async function registerRoutes(fastify: FastifyInstance) {
	fastify.post(
		"/",
		{
			config: {
				rateLimit: {
					max: 3,
					timeWindow: "15 minutes"
				}
			}
		},
		async (request, reply) => {
			let parsedBody;
			try {
				parsedBody = registerSchema.parse(request.body);
			} catch (error) {
				if (error instanceof z.ZodError) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
						.send({ message: error.issues });
				}

				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ message: ERROR_MESSAGES.SERVER.INTERNAL_ERROR });
			}

			const { email, password, username } = parsedBody;

			try {
				// Check if username already exists
				const existingUserByUsername = await User.findOne({ username });
				if (existingUserByUsername) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
						.send({ message: "Username already exists" });
				}

				// Check if email already exists
				const existingUserByEmail = await User.findOne({ email });
				if (existingUserByEmail) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
						.send({ message: "Email already exists" });
				}

				// Create a new user
				const user = new User({ email, password, username });
				await user.save();

				const authenticatedUserInfo = {
					userId: `${user._id}`,
					username: user.username,
					role: user.role,
					isAuthenticated: true
				};
				const token = generateToken(fastify, authenticatedUserInfo);
				const isProduction = process.env.NODE_ENV === environment.PRODUCTION;

				const cookieOptions = getCookieOptions({
					isProduction,
					...(process.env.FRONTEND_HOST && {
						frontendHost: process.env.FRONTEND_HOST
					}),
					maxAge: 7 * 24 * 60 * 60
				});

				return reply
					.status(httpResponseCodes.SUCCESSFUL.OK)
					.setCookie(cookieKeys.TOKEN, token, cookieOptions)
					.send({ message: "User registered successfully" });
			} catch (error) {
				if (error instanceof Error.ValidationError) {
					const messages = Object.values(error.errors).map(
						(err) => err.message
					);
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
						.send({
							message: ERROR_MESSAGES.FORM.VALIDATION_ERRORS,
							error: messages
						});
				} else if (error instanceof MongoError && error.code === 11000) {
					return reply
						.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
						.send({ message: `Duplicate key, unique value already exists` });
				}

				return reply
					.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
					.send({ message: ERROR_MESSAGES.SERVER.INTERNAL_ERROR, error });
			}
		}
	);
}
