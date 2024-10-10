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
import { GameEvent, GameEventEnum, GameEventUserInfo } from "types";
import Game from "./models/game/game.js";
import Puzzle, { PuzzleDocument } from "./models/puzzle/puzzle.js";
import mongoose from "mongoose";

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

const games: Map<string, Map<string, GameEventUserInfo>> = new Map();

function updatePlayersInGame(game: Map<string, GameEventUserInfo>) {
	const currentGame = JSON.stringify({
		game: Array.from(game.entries(), ([key, value]) => {
			return { username: key, joinedAt: value.joinedAt };
		})
	});

	game.forEach((userObj) => {
		userObj.socket.send(currentGame);
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

async function startGame({ gameId, socket }) {
	console.log("start the game event");

	const game = games.get(gameId);

	// [ongoing] create the game
	// [postpone] start countdown timer
	// players are trapped, hide the leave game option
	if (!game) {
		updatePlayer(socket, "error", "no game yo!");
		return;
	}
	console.log({ game });
	const playersInGame = Array.from(game.entries(), ([key, value]) => {
		return { username: key, ...value };
	});

	console.log({ playersInGame });

	const creator = playersInGame.reduce((oldestPlayer, currentPlayer) => {
		if (oldestPlayer.joinedAt < currentPlayer.joinedAt) {
			return oldestPlayer;
		} else {
			return currentPlayer;
		}
	}, playersInGame[0]);

	const randomPuzzles = await Puzzle.aggregate<PuzzleDocument>([{ $sample: { size: 1 } }]).exec();
	const randomPuzzle = randomPuzzles[0];

	console.log({ creator });

	const databaseGame = new Game({
		players: playersInGame.map((player) => player.userId),
		creator,
		puzzle: randomPuzzle._id
	});

	console.log({ databaseGame });
}

function hostGame({ userId, socket, username, event }) {
	const randomId = new mongoose.Types.ObjectId().toString();

	games.set(randomId, new Map());

	joinGame({ gameId: randomId, userId, socket, username, event });
}

function leaveGame({ gameId, socket, username, event }) {
	// if game exists
	if (games.has(gameId)) {
		// remove user from game
		const game = games.get(gameId);

		if (!game) {
			updatePlayer(socket, "error", "no game yo!");
			return;
		}

		if (username && game.has(username)) {
			game.delete(username);
		}

		// if game is empty
		if (game.size === 0) {
			// remove game, since no longer in use
			games.delete(gameId);
		} else {
			const game = games.get(gameId);

			if (game) {
				// notify people someone left
				updatePlayer(socket, event, "cya!");
				updatePlayersInGame(game);
			}
		}
	}
}

function joinGame({ gameId, userId, socket, username, event }) {
	const game = games.get(gameId);

	// add a user to the game
	if (game && username && userId) {
		game.set(username, { joinedAt: new Date(), socket, userId });

		// notify people someone joined
		updatePlayer(socket, event, gameId);
		updatePlayersInGame(game);
	}
}

// TODO: create activeplayerlist that hasn't joined game
// update all players in active list whenever someone joins/leaves/hosts a game

server.register(async function (fastify) {
	fastify.get("/", { websocket: true }, (socket: WebSocket, req: FastifyRequest) => {
		const joinableGames = Array.from(games.entries(), ([key, value]) => {
			return { id: key, amountOfPlayersJoined: value.size };
		});

		socket.send(JSON.stringify({ event: "welcome", games: joinableGames }));

		socket.on("message", async (message) => {
			const data: GameEvent = JSON.parse(message.toString());
			const { event, gameId, username, userId } = data;

			console.log(JSON.parse(message.toString()));

			if (event === GameEventEnum.HOST_GAME) {
				console.log("hosting a game");
				hostGame({ userId, socket, username, event });
				return;
			}

			if (!gameId) {
				updatePlayer(socket, "error", "no gameId yo!");
				return;
			}

			switch (event) {
				case GameEventEnum.JOIN_GAME:
					{
						if (!username || !userId) {

							break;
						}

						joinGame({ gameId, userId, socket, username, event });
					}
					break;
				case GameEventEnum.LEAVE_GAME:
					{
						const { username } = data;

						leaveGame({ gameId, socket, username, event });
					}
					break;
				case GameEventEnum.START_GAME:
					{
						startGame({ gameId, socket });

						// when game is started, removed from joinable games
						games.delete(gameId);
					}
					break;
				default:
					socket.send("hi from server");
					break;
			}
		});

		socket.on("close", (code, reason) => {
			console.log({ code, reason: reason.toString() });
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
