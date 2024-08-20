// require external modules
import dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
import dbConnectorPlugin from "./plugins/config/db-connector.js";
import cors from "./plugins/config/cors.js";
import jwt from "./plugins/config/jwt.js";
import fastifyFormbody from "@fastify/formbody";
import mongooseConnector from "./plugins/config/mongoose.js";
import router from "./router.js";
import { schemas } from "./config/schema.js";
import fastifyCookie from "@fastify/cookie";

const server = Fastify({
	logger: true // Boolean(process.env.NODE_ENV !== "development")
});

for (let schema of [...schemas]) {
	server.addSchema(schema);
}

// register fastify ecosystem plugins
server.register(fastifyCookie, {
	secret: process.env.COOKIE_SECRET,
	hook: "onRequest",
	parseOptions: {}
});

server.register(cors);
server.register(jwt);
// server.register(dbConnectorPlugin);
server.register(fastifyFormbody);
server.register(mongooseConnector);

// register custom plugins

// middelware
// server.decorate("authenticate", authenticate.bind(null, server));

// routes
server.register(router);

export default server;
