import Puzzle from "@/models/puzzle/puzzle.js";
import Submission from "@/models/submission/submission.js";
import User from "@/models/user/user.js";
import { FastifyInstance } from "fastify";
import { httpResponseCodes, isUsername, puzzleVisibilityEnum } from "types";
import { ParamsUsername } from "../types.js";
import {
	genericReturnMessages,
	userProperties
} from "@/config/generic-return-messages.js";

export default async function userByUsernameActivityRoutes(
	fastify: FastifyInstance
) {
	fastify.get<ParamsUsername>("/", async (request, reply) => {
		const { username } = request.params;

		if (!isUsername(username)) {
			const { BAD_REQUEST } = httpResponseCodes.CLIENT_ERROR;
			const { IS_INVALID } = genericReturnMessages[BAD_REQUEST];
			const { USERNAME } = userProperties;

			return reply.status(BAD_REQUEST).send({
				message: `${USERNAME} ${IS_INVALID}`
			});
		}

		try {
			const user = await User.findOne({ username });

			if (!user) {
				return reply
					.status(httpResponseCodes.CLIENT_ERROR.NOT_FOUND)
					.send({ message: "User not found" });
			}

			const userId = user._id;

			const [puzzlesByUser, submissionsByUser] = await Promise.all([
				// TODO: add other puzzle visibility states as well?
				Puzzle.find({
					author: userId,
					visibility: puzzleVisibilityEnum.APPROVED
				}),
				Submission.find({ user: userId }).populate("programmingLanguage")
			]);

			return reply.status(httpResponseCodes.SUCCESSFUL.OK).send({
				user,
				message: "User activity found",
				activity: { puzzles: puzzlesByUser, submissions: submissionsByUser }
			});
		} catch (error) {
			return reply
				.status(httpResponseCodes.SERVER_ERROR.INTERNAL_SERVER_ERROR)
				.send({ message: "Internal Server Error" });
		}
	});
}
