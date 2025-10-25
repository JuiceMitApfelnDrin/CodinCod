// require external modules
import dotenv from "dotenv";
dotenv.config();

import websocket from "@fastify/websocket";
import Fastify from "fastify";
import cors from "./plugins/config/cors.js";
import jwt from "./plugins/config/jwt.js";
import fastifyFormbody from "@fastify/formbody";
import mongooseConnector from "./plugins/config/mongoose.js";
import router from "./router.js";
import fastifyCookie, { FastifyCookieOptions } from "@fastify/cookie";
import piston from "./plugins/decorators/piston.js";
import { setupWebSockets } from "./plugins/config/setup-web-sockets.js";
import fastifyRateLimit from "@fastify/rate-limit";
import requestLogger from "./plugins/middleware/request-logger.js";
import { environment, httpResponseCodes } from "types";

const server = Fastify({
	logger: Boolean(process.env.NODE_ENV !== environment.DEVELOPMENT)
});

// register fastify ecosystem plugins
server.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET
} as FastifyCookieOptions);
server.register(requestLogger);
server.register(fastifyRateLimit, {
	max: 100,
	timeWindow: "1 minute",
	errorResponseBuilder: (request, context) => {
		return {
			statusCode: httpResponseCodes.CLIENT_ERROR.TOO_MANY_REQUESTS,
			error: "Too Many Requests",
			message: `Rate limit exceeded. Please try again in ${Math.ceil(context.ttl / 1000)} seconds.`,
			retryAfter: Math.ceil(context.ttl / 1000)
		};
	}
});
server.register(cors);
server.register(jwt);
server.register(fastifyFormbody);
server.register(mongooseConnector);
server.register(piston);
server.register(websocket, {
	options: {
		verifyClient: (info, next) => {
			// Allow WebSocket connections from the configured frontend URL
			const origin = info.origin || info.req.headers.origin;
			const allowedOrigin = process.env.FRONTEND_URL ?? "http://localhost:5173";
			
			if (origin === allowedOrigin) {
				next(true);
			} else {
				console.warn(`WebSocket connection rejected from origin: ${origin}`);
				next(false, 403, "Forbidden");
			}
		}
	}
});
server.register(setupWebSockets);

// routes
server.register(router);

export default server;
