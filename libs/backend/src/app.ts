// require external modules
import dotenv from "dotenv";
dotenv.config();

import Fastify, { FastifyRequest } from "fastify";
import cors from "./plugins/config/cors.js";
import jwt from "./plugins/config/jwt.js";
import websocket, { WebSocket } from "@fastify/websocket";
import fastifyFormbody from "@fastify/formbody";
import mongooseConnector from "./plugins/config/mongoose.js";
import router from "./router.js";
import { schemas } from "./config/schema.js";
import fastifyCookie from "@fastify/cookie";
import swagger from "./plugins/config/swagger.js";
import swaggerUi from "./plugins/config/swagger-ui.js";
import piston from "./plugins/decorators/piston.js";
import { WebSocketGamesMap } from "./types/games.js";
import { onMessage } from "./websocket/on-message.js";
import { updateActivePlayers } from "./websocket/update-active-players.js";
import { onConnection } from "./websocket/on-connection.js";
import { onClose } from "./websocket/on-close.js";

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

const games: WebSocketGamesMap = new Map();
const activePlayerList: WebSocket[] = [];

server.register(async function (fastify) {
	fastify.get("/", { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
		onConnection({ activePlayers: activePlayerList, games, newPlayerSocket: socket });

		socket.on("message", (message) => {
			onMessage({ message, games, socket, activePlayers: activePlayerList });
			updateActivePlayers({ sockets: activePlayerList, games });
		});

		socket.on("close", (code, reason) => {
			onClose({ code, reason, activePlayers: activePlayerList, playerSocketToRemove: socket });
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
