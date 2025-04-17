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

const server = Fastify({
	logger: Boolean(process.env.NODE_ENV !== "development")
});

// register fastify ecosystem plugins
server.register(fastifyCookie, {
	hook: "onRequest",
	parseOptions: {},
	secret: process.env.COOKIE_SECRET
} as FastifyCookieOptions);
server.register(fastifyRateLimit, {
	max: 100,
	timeWindow: "1 minute"
});
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
