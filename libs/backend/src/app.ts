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

const rooms = new Map();

function updatePlayersInRoom(room: Map<string, { socket: WebSocket; joinedAt: Date }>) {
	room.forEach((userObj) => {
		console.log({ userObj, room });

		userObj.socket.send(
			JSON.stringify({
				room: Array.from(room.entries(), ([key, value]) => {
					return { username: key, joinedAt: value.joinedAt };
				})
			})
		);
	});
}

function updatePlayer(socket: WebSocket, event: string, message: string) {
	socket.send(
		JSON.stringify({
			event,
			message
		})
	);
}

server.register(async function (fastify) {
	fastify.get("/", { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
		socket.on("message", (message) => {
			const data: { event: string; username?: string; roomId?: string } = JSON.parse(
				message.toString()
			);
			const { event } = data;

			console.log(JSON.parse(message.toString()));
			switch (event) {
				case "join:room":
					{
						const { roomId, username } = data;

						if (!rooms.has(roomId)) {
							rooms.set(roomId, new Map());
						}

						// add a user to the room
						const room = rooms.get(roomId);
						room.set(username, { joinedAt: new Date(), socket });

						// notify people someone joined
						updatePlayer(socket, event, "welcome!");
						updatePlayersInRoom(room);
					}
					break;
				case "leave:room":
					{
						const { roomId, username } = data;

						// if room exists
						if (rooms.has(roomId)) {
							// remove user from room
							const room = rooms.get(roomId);

							if (room.has(username)) {
								room.delete(username);
							}
						}

						// if room is empty
						if (rooms.size === 0) {
							// remove room, since no longer in use
							rooms.delete(roomId);
						} else {
							const room = rooms.get(roomId);

							// notify people someone left
							updatePlayer(socket, event, "cya!");
							updatePlayersInRoom(room);
						}
					}
					break;
				default:
					socket.send("hi from server");
					break;
			}

			console.log(rooms);
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
