import { FastifyInstance } from "fastify";

export default async function submissionController(fastify: FastifyInstance) {
	// CRUD operations for submissions
	// fastify.route({
	// 	handler: async (request, reply) => {
	// 		const { id } = request.params;
	// 		try {
	// 			switch (request.method) {
	// 				case GET: {
	// 					if (id) {
	// 						const submission = await Submission.findById(id).populate("user_id puzzle_id");
	// 						if (!submission) {
	// 							return reply.status(404).send({ message: "Submission not found" });
	// 						}
	// 						reply.send(submission);
	// 					} else {
	// 						const submissions = await Submission.find().populate("user_id puzzle_id");
	// 						reply.send(submissions);
	// 					}
	// 					break;
	// 				}
	// 				case POST: {
	// 					const { user_id, puzzle_id, code, result } = request.body;
	// 					const submission = new Submission({
	// 						code,
	// 						puzzle_id,
	// 						result,
	// 						user_id
	// 					});
	// 					await submission.save();
	// 					reply.send(submission);
	// 					break;
	// 				}
	// 				case PUT: {
	// 					const updatedSubmission = await Submission.findByIdAndUpdate(id, request.body, {
	// 						new: true
	// 					});
	// 					reply.send(updatedSubmission);
	// 					break;
	// 				}
	// 				case DELETE: {
	// 					await Submission.findByIdAndDelete(id);
	// 					reply.send({ message: "Submission deleted" });
	// 					break;
	// 				}
	// 				default: {
	// 					reply.status(500).send({ message: "Unable to process this request" });
	// 				}
	// 			}
	// 		} catch (error) {
	// 			reply.status(500).send(error);
	// 		}
	// 	},
	// 	method: [GET, POST, PUT, DELETE],
	// 	onRequest : [fastify.authenticate],
	// 	url: "/:id?"
	// });
}
