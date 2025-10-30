import {
	AuthenticatedInfo,
	gameEventEnum,
	getUserIdFromUser,
	isGameDto,
	isPuzzleDto,
	isString,
	ObjectId,
	websocketCloseCodes
} from "types";
import { UserWebSockets } from "./user-web-sockets.js";
import { WebSocket } from "@fastify/websocket";
import { gameService } from "@/services/game.service.js";
import { puzzleService } from "@/services/puzzle.service.js";

export async function onConnection(
	userWebSockets: UserWebSockets,
	user: AuthenticatedInfo,
	gameId: ObjectId,
	socket: WebSocket
): Promise<void> {
	try {
		const game = await gameService.findByIdPopulated(gameId);

		if (!isGameDto(game)) {
			socket.send(
				JSON.stringify({
					event: gameEventEnum.NONEXISTENT_GAME,
					message: "Game not found"
				})
			);
			socket.close(websocketCloseCodes.POLICY_VIOLATION, "Game not found");
			return;
		}

		const isPlayerInGame = game.players.some(
			(player) => getUserIdFromUser(player) === user.userId
		);

		if (!isPlayerInGame) {
			socket.send(
				JSON.stringify({
					event: gameEventEnum.OVERVIEW_GAME,
					game
				})
			);
			socket.send(
				JSON.stringify({
					event: gameEventEnum.ERROR,
					message: `User not in this game`
				})
			);
			socket.close(1008, "User not in game");
			return;
		}

		userWebSockets.add(user.username, socket, user);

		const isGameFinished = game.endTime < new Date();
		if (isGameFinished) {
			userWebSockets.updateUser(user.username, {
				event: gameEventEnum.FINISHED_GAME,
				game
			});
			return;
		}

		const puzzleId = isString(game.puzzle)
			? game.puzzle
			: game.puzzle._id.toString();
		const puzzle = await puzzleService.findByIdPopulated(puzzleId);

		if (!isPuzzleDto(puzzle)) {
			userWebSockets.updateUser(user.username, {
				event: gameEventEnum.ERROR,
				message: "Puzzle not found"
			});
			return;
		}

		userWebSockets.updateUser(user.username, {
			event: gameEventEnum.OVERVIEW_GAME,
			game,
			puzzle
		});
	} catch (error) {
		console.error("Error in game websocket connection:", error);
		socket.close(websocketCloseCodes.INTERNAL_ERROR, "Internal server error");
	}
}
