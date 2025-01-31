// require external modules
import dotenv from "dotenv";
dotenv.config();

import fastifyCookie from "@fastify/cookie";
import fastifyFormbody from "@fastify/formbody";
import Fastify from "fastify";
import { schemas } from "./config/schema.ts";
import cors from "./plugins/config/cors.ts";
import jwt from "./plugins/config/jwt.ts";
import mongooseConnector from "./plugins/config/mongoose.ts";
import swaggerUi from "./plugins/config/swagger-ui.ts";
import swagger from "./plugins/config/swagger.ts";
import piston from "./plugins/decorators/piston.ts";
import router from "./router.ts";

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
server.register(swagger);
server.register(jwt);
server.register(swaggerUi);

// server.register(dbConnectorPlugin);
server.register(fastifyFormbody);
server.register(mongooseConnector);
server.register(piston);

// register custom plugins

// middelware
// server.decorate("authenticate", authenticate.bind(null, server));

// routes
server.register(router);

export default server;
