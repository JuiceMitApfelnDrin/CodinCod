// require external modules
import websocket from "@fastify/websocket";
import Fastify from "fastify";
import cors from "./plugins/config/cors.js";
import jwt from "./plugins/config/jwt.js";
import fastifyFormbody from "@fastify/formbody";
import mongooseConnector from "./plugins/config/mongoose.js";
import router from "./router.js";
import fastifyCookie from "@fastify/cookie";
import piston from "./plugins/decorators/piston.js";
import { setupWebSockets } from "./plugins/config/setup-web-sockets.js";
import fastifyRateLimit from "@fastify/rate-limit";
import authRateLimit from "./plugins/config/auth-rate-limit.js";
import inputSanitization from "./plugins/middleware/input-sanitization.js";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
	serializerCompiler,
	validatorCompiler,
	jsonSchemaTransform
} from "fastify-type-provider-zod";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUI from "@fastify/swagger-ui";
import pkg from "../package.json" with { type: "json" };
import { backendUrls, environment } from "types";

const server = Fastify({
	logger: {
		level: process.env.NODE_ENV === environment.PRODUCTION ? "info" : "debug"
	}
}).withTypeProvider<ZodTypeProvider>();

// Set up Zod validation and serialization
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// Register Swagger for API documentation
server.register(fastifySwagger, {
	openapi: {
		info: {
			title: "CodinCod API",
			description: "API for the CodinCod coding challenge platform",
			version: pkg.version
		},
		servers: [
			{
				url: "http://localhost:8888",
				description: "Development server"
			}
		],
		components: {
			securitySchemes: {
				bearerAuth: {
					type: "http",
					scheme: "bearer",
					bearerFormat: "JWT"
				}
			}
		}
	},
	transform: jsonSchemaTransform
});

server.register(fastifySwaggerUI, {
	routePrefix: backendUrls.DOCUMENTATION,
	uiConfig: {
		docExpansion: "list",
		deepLinking: false
	},
	staticCSP: true,
	transformSpecificationClone: true
});

// register fastify ecosystem plugins
server.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET || "your_jwt_secret_here",
	hook: "onRequest",
	parseOptions: {}
});
server.register(fastifyRateLimit, {
	max: 100,
	timeWindow: "1 minute"
});
server.register(authRateLimit);
server.register(inputSanitization);
server.register(cors);
server.register(jwt);
server.register(fastifyFormbody);
server.register(mongooseConnector);
server.register(piston);
server.register(websocket);
server.register(setupWebSockets);

// routes
server.register(router);

export default server;
