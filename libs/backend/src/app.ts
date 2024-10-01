// require external modules
import dotenv from "dotenv";
dotenv.config();

import Fastify from "fastify";
import cors from "./plugins/config/cors.js";
import jwt from "./plugins/config/jwt.js";
import websocket from "@fastify/websocket";
import fastifyFormbody from "@fastify/formbody";
import mongooseConnector from "./plugins/config/mongoose.js";
import router from "./router.js";
import { schemas } from "./config/schema.js";
import fastifyCookie from "@fastify/cookie";
import swagger from "./plugins/config/swagger.js";
import swaggerUi from "./plugins/config/swagger-ui.js";
import piston from "./plugins/decorators/piston.js";

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
server.register(websocket);
server.register(async function (fastify) {
	fastify.get("/", { websocket: true }, (socket /* WebSocket */, req /* FastifyRequest */) => {
		socket.on("message", (message) => {
			console.log(message.toString());
			socket.send("hi from server");
		});
	});
});

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
