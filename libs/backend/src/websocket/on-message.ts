import { GameEvent, GameEventEnum, isString } from "types";
import { updatePlayer } from "./update-player.js";
import { hostGame } from "./host-game.js";
import { joinGame } from "./join-game.js";
import { leaveGame } from "./leave-game.js";
import { startGame } from "./start-game.js";
import { WebSocketGamesMap } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";
import { RawData } from "ws";
import { removePlayerFromPlayers } from "./remove-player-from-active-players.js";
import { addPlayerToPlayers } from "./add-player-to-active-players.js";

export async function onMessage({
	message,
	socket,
	games,
	players
}: {
	message: RawData;
	socket: WebSocket;
	games: WebSocketGamesMap;
	players: WebSocket[];
}) {
	const data: GameEvent = JSON.parse(message.toString());
	const { event, gameId, username, userId } = data;

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
		removePlayerFromPlayers({ players, playerSocketToRemove: socket });
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
			removePlayerFromPlayers({ players, playerSocketToRemove: socket });
			return;
		}
		case GameEventEnum.LEAVE_GAME:
			{
				const { username } = data;

				if (!isString(username)) {
					updatePlayer({
						socket,
						event: GameEventEnum.INCORRECT_VALUE,
						message: `username (${username}) is not a string`
					});
					return;
				}

				leaveGame({ gameId, socket, username, games });
				addPlayerToPlayers({ players, playerSocketToAdd: socket });
			}
			return;
		case GameEventEnum.START_GAME:
			{
				startGame({ gameId, socket, games });
			}
			return;
		default:
			socket.send("hi from server");
			return;
	}
}
