import fastifySwaggerUi from "@fastify/swagger-ui";
import { FastifyInstance } from "fastify";
import fastifyPlugin from "fastify-plugin";

async function swaggerUi(fastify: FastifyInstance) {
	await fastify.register(fastifySwaggerUi, {
		routePrefix: "/documentation",
		uiConfig: {
			docExpansion: "full",
			deepLinking: false
		},
		uiHooks: {
			onRequest: function (request, reply, next) {
				next();
			},
			preHandler: function (request, reply, next) {
				next();
			}
		},
		staticCSP: true,
		transformStaticCSP: (header) => header,
		transformSpecification: (swaggerObject, request, reply) => {
			return swaggerObject;
		},
		transformSpecificationClone: true
	});
}

export default fastifyPlugin(swaggerUi);
