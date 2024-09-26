import { FastifyInstance } from "fastify";

export default async function userProfileRoutes(fastify: FastifyInstance) {
	fastify.post("/", {}, async (request, reply) => {
		// const parseResult = createPuzzleSchema.safeParse(request.body);
		// if (!parseResult.success) {
		// 	return reply.status(400).send({ error: parseResult.error.errors });
		// }
		// if (!isAuthenticatedInfo(request.user)) {
		// 	return reply.status(401).send({ error: "Not right credentials" });
		// }
		// const user = request.user;
		// const userId = user.userId;
		// const puzzleData = {
		// 	...parseResult.data,
		// 	authorId: userId
		// };
		// try {
		// 	const puzzle = new Puzzle(puzzleData);
		// 	await puzzle.save();
		// 	return reply.status(201).send(puzzle);
		// } catch (error) {
		// 	return reply.status(500).send({ error: "Failed to create puzzle" });
		// }
	});
}
