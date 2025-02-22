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
import fastifyCookie from "@fastify/cookie";
import piston from "./plugins/decorators/piston.js";
import { setupWebSockets } from "./plugins/config/setup-web-sockets.js";
import fastifyRateLimit from "@fastify/rate-limit";

const server = Fastify({
	logger: Boolean(process.env.NODE_ENV !== "development")
});

// register fastify ecosystem plugins
server.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET,
	hook: "onRequest",
	parseOptions: {}
});

// TODO: make this not show an error, appears to work tho, check wtf is going wrong
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

// register custom plugins

// middelware
// server.decorate("authenticate", authenticate.bind(null, server));

// routes
server.register(router);

export default server;
