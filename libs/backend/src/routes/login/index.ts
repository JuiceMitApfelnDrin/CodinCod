import { FastifyInstance } from "fastify";
import bcrypt from "bcrypt";
import { cookieKeys, isEmail, loginSchema } from "types";
import User from "../../models/user/user.js";
import { generateToken } from "../../utils/functions/generate-token.js";

export default async function loginRoutes(fastify: FastifyInstance) {
	fastify.post("/", async (request, reply) => {
		const parseResult = loginSchema.safeParse(request.body);

		if (!parseResult.success) {
			return reply.status(400).send({ message: "Invalid request data" });
		}

		const { identifier, password } = parseResult.data;

		try {
			const user = isEmail(identifier)
				? await User.findOne({ email: identifier }).select("+password")
				: await User.findOne({ username: identifier }).select("+password").exec();

			if (!user) {
				return reply.status(400).send({ message: "Invalid email/username or password" });
			}
			const isMatch = await bcrypt.compare(password, user.password);

			if (!isMatch) {
				return reply.status(400).send({ message: "Invalid email/username or password" });
			}

			const authenticatedUserInfo = {
				userId: `${user._id}`,
				username: user.username,
				isAuthenticated: true
			};
			const token = generateToken(fastify, authenticatedUserInfo);

			return reply
				.status(200)
				.setCookie(cookieKeys.TOKEN, token, {
					path: "/",
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
					maxAge: 3600
				})
				.send({ message: "Login successful" });
		} catch (error) {
			return reply.status(500).send({ message: error });
		}
	});
}
