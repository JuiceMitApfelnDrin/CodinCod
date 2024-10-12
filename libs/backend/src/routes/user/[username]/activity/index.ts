import Puzzle from "@/models/puzzle/puzzle.js";
import Submission from "@/models/submission/submission.js";
import User from "@/models/user/user.js";
import { FastifyInstance } from "fastify";
import { userEntitySchema } from "types";

export default async function userByUsernameActivityRoutes(fastify: FastifyInstance) {
	fastify.get("/", async (request, reply) => {
		const parseResult = userEntitySchema.pick({ username: true }).safeParse(request.params);

		if (!parseResult.success) {
			return reply.status(400).send({ message: "Invalid request data" });
		}

		const { username } = parseResult.data;

		try {
			const user = await User.findOne({ username });

			if (!user) {
				return reply.status(404).send({ message: "User not found" });
			}

			const userId = user._id;

			const [puzzlesByUser, submissionsByUser] = await Promise.all([
				Puzzle.find({ authorId: userId }),
				Submission.find({ userId: userId })
			]);

			return reply.status(200).send({
				user,
				message: "User activity found",
				activity: { puzzles: puzzlesByUser, submissions: submissionsByUser }
			});
		} catch (error) {
			return reply.status(500).send({ message: "Internal Server Error" });
		}
	});
}
