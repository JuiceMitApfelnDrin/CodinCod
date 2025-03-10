import { FastifyInstance } from "fastify";
import { z } from "zod";
import { Error } from "mongoose";
import { MongoError } from "mongodb";
import User from "../../models/user/user.js";
import { cookieKeys, registerSchema } from "types";
import { generateToken } from "../../utils/functions/generate-token.js";

export default async function registerRoutes(fastify: FastifyInstance) {
	fastify.post("/", async (request, reply) => {
		let parsedBody;
		try {
			parsedBody = registerSchema.parse(request.body);
		} catch (error) {
			if (error instanceof z.ZodError) {
				return reply.status(400).send({ message: error.errors });
			}

			return reply.status(500).send({ message: "Internal Server Error" });
		}

		const { email, password, username } = parsedBody;

		try {
			// Check if username already exists
			const existingUserByUsername = await User.findOne({ username });
			if (existingUserByUsername) {
				return reply.status(400).send({ message: "Username already exists" });
			}

			// Check if email already exists
			const existingUserByEmail = await User.findOne({ email });
			if (existingUserByEmail) {
				return reply.status(400).send({ message: "Email already exists" });
			}

			// Create a new user
			const user = new User({ email, password, username });
			await user.save();

			// TODO: give information back to the user about the user in question, see registerresponseschema

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
					domain: process.env.NODE_ENV === "production" ? ".codincod.com" : "localhost",
					maxAge: 3600
				})
				.send({ message: "User registered successfully" });
		} catch (error) {
			if (error instanceof Error.ValidationError) {
				const messages = Object.values(error.errors).map((err) => err.message);
				return reply.status(400).send({
					message: "Could not create user due to some invalid fields!",
					error: messages
				});
			} else if (error instanceof MongoError && error.code === 11000) {
				return reply.status(400).send({ message: `Duplicate key, unique value already exists` });
			}

			return reply.status(500).send({ message: "Internal server error", error });
		}
	});
}
