import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import User from "../../models/user/user.js";
import { generateToken } from "../../utils/functions/generate-token.js";
import { cookieKeys, ErrorResponse, httpResponseCodes, isEmail, loginSchema } from "types";

export default async function loginRoutes(fastify: FastifyInstance) {
	fastify.post("/", async (request, reply) => {
		const parseResult = loginSchema.safeParse(request.body);

		if (!parseResult.success) {
			const errorResponse: ErrorResponse = {
				error: "Invalid request data",
				message: "" + parseResult.error.errors
			};

			return reply.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST).send(errorResponse);
		}

		const { identifier, password } = parseResult.data;

		try {
			const user = isEmail(identifier)
				? await User.findOne({ email: identifier }).select("+password")
				: await User.findOne({ username: identifier }).select("+password").exec();

			if (!user) {
				const errorResponse: ErrorResponse = {
					error: "Invalid email/username or password",
					message: "Can't be authenticated"
				};

				return reply.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST).send(errorResponse);
			}
			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.BAD_REQUEST)
					.send({ message: "Invalid email/username or password" });
			}

			const authenticatedUserInfo = {
				isAuthenticated: true,
				userId: `${user._id}`,
				username: user.username,
			};
			const token = generateToken(fastify, authenticatedUserInfo);

			return reply
				.status(httpResponseCodes.SUCCESSFUL.OK)
				.setCookie(cookieKeys.TOKEN, token, {
					domain: process.env.FRONTEND_HOST ?? "localhost",
					httpOnly: true,
					maxAge: 3600,
					path: "/",
					sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
					secure: process.env.NODE_ENV === "production"
				})
				.send({ message: "Login successful" });
		} catch (error) {
			const errorResponse: ErrorResponse = {
				error: "Failed to login",
				message: "" + error
			};

			return reply.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR).send(errorResponse);
		}
	});
}
