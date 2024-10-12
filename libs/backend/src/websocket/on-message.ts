import { GameEvent, GameEventEnum, isString } from "types";
import { updatePlayer } from "./update-player.js";
import { hostGame } from "./host-game.js";
import { joinGame } from "./join-game.js";
import { leaveGame } from "./leave-game.js";
import { startGame } from "./start-game.js";
import { WebSocketGamesMap } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";
import { RawData } from "ws";
import { removePlayerFromActivePlayers } from "./remove-player-from-active-players.js";
import { addPlayerToActivePlayers } from "./add-player-to-active-players.js";

export async function onMessage({
	message,
	socket,
	games,
	activePlayers
}: {
	message: RawData;
	socket: WebSocket;
	games: WebSocketGamesMap;
	activePlayers: WebSocket[];
}) {
	const data: GameEvent = JSON.parse(message.toString());
	const { event, gameId, username, userId } = data;

	console.log({ messageReceived: JSON.parse(message.toString()) });

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
		removePlayerFromActivePlayers({ activePlayers, playerSocketToRemove: socket });
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
		case GameEventEnum.JOIN_GAME:
			{
				if (!username || !userId) {
					break;
				}

				joinGame({ gameId, userId, socket, username, event, games });
				removePlayerFromActivePlayers({ activePlayers, playerSocketToRemove: socket });
			}
			break;
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
				addPlayerToActivePlayers({ activePlayers, playerSocketToAdd: socket });
			}
			break;
		case GameEventEnum.START_GAME:
			{
				startGame({ gameId, socket, games });

				// when game is started, removed from joinable games
				games.delete(gameId);
			}
			break;
		default:
			socket.send("hi from server");
			break;
	}
}
