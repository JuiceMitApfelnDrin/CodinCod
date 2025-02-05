import { GameEventEnum, isString } from "types";
import { updatePlayer } from "../common/update-player.js";
import { hostGame } from "./host-game.js";
import { joinGame } from "./join-game.js";
import { leaveGame } from "./leave-game.js";
import { startGame } from "./start-game.js";
import { WebSocket } from "@fastify/websocket";
import { RawData } from "ws";
import { addPlayerToPlayers } from "../common/add-player-to-players.js";
import { parseRawDataMessage } from "@/utils/functions/parse-raw-data-message.js";
import { FastifyInstance } from "fastify";

export async function onMessage({
	message,
	socket,
	fastify,
	username,
	userId
}: {
	message: RawData;
	socket: WebSocket;
	fastify: FastifyInstance;
	username: string;
	userId: string;
}) {
	let parsedMessage = parseRawDataMessage(message, socket);

	if (!parsedMessage) {
		return;
	}

	const { event, roomId } = parsedMessage;

	if (event === GameEventEnum.HOST_GAME) {
		if (!isString(userId)) {
			updatePlayer({
				socket,
				event: GameEventEnum.INCORRECT_VALUE,
				message: `userId (${userId}) is not a string`
			});
			return;
		}

		if (!isString(username)) {
			updatePlayer({
				socket,
				event: GameEventEnum.INCORRECT_VALUE,
				message: `username (${username}) is not a string`
			});
			return;
		}

		hostGame({ userId, socket, username, fastify });
		return;
	}

	if (!roomId) {
		updatePlayer({
			socket,
			event: GameEventEnum.NONEXISTENT_GAME,
			message: `game with id (${roomId}) doesn't exist`
		});
		return;
	}

	switch (event) {
		case GameEventEnum.JOIN_GAME: {
			joinGame({ roomId, userId, socket, username, fastify });
			return;
		}
		case GameEventEnum.LEAVE_GAME: {
			if (!isString(username)) {
				updatePlayer({
					socket,
					event: GameEventEnum.INCORRECT_VALUE,
					message: `username (${username}) is not a string`
				});
				return;
			}

			leaveGame({ roomId, socket, username, games });
			addPlayerToPlayers({ players, playerSocketToAdd: socket });
			return;
		}
		case GameEventEnum.START_GAME: {
			startGame({ roomId, socket });
			return;
		}
		default:
			socket.send("hi from server");
			return;
	}
}
