import Game from "@/models/game/game.js";
import Puzzle from "@/models/puzzle/puzzle.js";
import {
	AuthenticatedInfo,
	gameEventEnum,
	GameResponse,
	getUserIdFromUser,
	isGameDto,
	isPuzzleDto,
	ObjectId
} from "types";
import { UserWebSockets } from "./user-web-sockets.js";
import { WebSocket } from "@fastify/websocket";

export async function onConnection(
	userWebSockets: UserWebSockets,
	user: AuthenticatedInfo,
	gameId: ObjectId,
	socket: WebSocket
): Promise<void> {
	try {
		const game = await Game.findById(gameId)
			.populate("owner")
			.populate("players")
			.populate({
				path: "playerSubmissions",
				populate: { path: "user" }
			})
			.exec();

		if (!isGameDto(game)) {
			const response: GameResponse = {
				event: gameEventEnum.NONEXISTENT_GAME,
				message: "Game not found"
			};
			socket.send(JSON.stringify(response));
			socket.close(1008, "Game not found");
			return;
		}

		const currentPlayerIndex = game.players.findIndex((player) => {
			return getUserIdFromUser(player) === user.userId;
		});

		if (currentPlayerIndex === -1) {
			const gameOverviewResponse: GameResponse = {
				event: gameEventEnum.OVERVIEW_GAME,
				game
			};
			socket.send(JSON.stringify(gameOverviewResponse));

			const errorResponse: GameResponse = {
				event: gameEventEnum.ERROR,
				message: `User ${user.userId} hasn't joined this game`
			};
			socket.send(JSON.stringify(errorResponse));
			socket.close(1008, "User not in game");
			return;
		}

		userWebSockets.add(user.username, socket, user);

		const currentTime = new Date();
		if (game.endTime < currentTime) {
			userWebSockets.updateUser(user.username, {
				event: gameEventEnum.FINISHED_GAME,
				game
			});
			return;
		}

		const puzzle = await Puzzle.findById(game.puzzle).populate("author");

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
		console.error("Error in onConnection:", error);
		socket.close(1011, "Internal server error");
	}
}
