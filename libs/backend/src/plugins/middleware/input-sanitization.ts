import fastifyPlugin from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { sanitizeInput } from "../../helpers/sanitization.helpers.js";
import { environment } from "types";

export default fastifyPlugin(async function inputSanitization(
	fastify: FastifyInstance
) {
	// Add sanitization hook for all requests
	fastify.addHook("preHandler", sanitizeInput);

	if (process.env.NODE_ENV === environment.DEVELOPMENT) {
		fastify.addHook("preHandler", async (request, reply) => {
			if (request.body || request.query) {
				request.log.debug("Input sanitization applied to request");
			}
		});
	}
});
