import { AuthenticatedInfo, GameEventEnum, isString } from "types";
import { updatePlayer } from "../common/update-player.js";
import { hostGame } from "./host-game.js";
import { joinGame } from "./join-game.js";
import { leaveGame } from "./leave-game.js";
import { startGame } from "./start-game.js";
import { OpenGames } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";
import { RawData } from "ws";
import { removePlayerFromPlayers } from "../common/remove-player-from-players.js";
import { addPlayerToPlayers } from "../common/add-player-to-players.js";
import { parseRawDataMessage } from "@/utils/functions/parse-raw-data-message.js";
import { MapUsernameToGame, MapUsernameToSocket } from "./waiting-room.js";

export async function onMessage({
	message,
	socket,
	games,
	players,
	user,
	gamesByUsername
}: {
	message: RawData;
	socket: WebSocket;
	games: OpenGames;
	players: MapUsernameToSocket;
	user: AuthenticatedInfo;
	gamesByUsername: MapUsernameToGame;
}) {
	let parsedMessage = parseRawDataMessage(message, socket);

	if (!parsedMessage) {
		return;
	}

	const { event, gameId, username, userId } = parsedMessage;

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

		hostGame({ userId, socket, username, event, games });
		removePlayerFromPlayers({ players, user });
		return;
	}

	if (!gameId) {
		updatePlayer({
			socket,
			event: GameEventEnum.NONEXISTENT_GAME,
			message: `game with id (${gameId}) doesn't exist`
		});
		return;
	}

	switch (event) {
		case GameEventEnum.JOIN_GAME: {
			if (!username || !userId) {
				return;
			}

			joinGame({ gameId, userId, socket, username, event, games });
			removePlayerFromPlayers({ players, user });
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

			leaveGame({ gameId, socket, username, games });
			addPlayerToPlayers({ players, user, playerSocketToAdd: socket });
			return;
		}
		case GameEventEnum.START_GAME: {
			startGame({ gameId, socket, games });
			return;
		}
		default:
			socket.send("hi from server");
			return;
	}
}
