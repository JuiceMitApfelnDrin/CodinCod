import Game from "@/models/game/game.js";
import Puzzle from "@/models/puzzle/puzzle.js";
import {
	AuthenticatedInfo,
	gameEventEnum,
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
) {
	const game = await Game.findById(gameId)
		.populate("owner")
		.populate("players")
		/* deeply populated, for every playerSubmission populate the userId field with a user */
		.populate({
			path: "playerSubmissions",
			populate: {
				path: "user"
			}
		})
		.exec();

	if (!isGameDto(game)) {
		return socket.send(
			JSON.stringify({
				event: gameEventEnum.NONEXISTENT_GAME,
				message: "game couldn't be found"
			})
		);
	}

	const currentPlayerIndex = game.players.findIndex((player) => {
		return getUserIdFromUser(player) === user.userId;
	});
	if (currentPlayerIndex === -1) {
		return socket.send(
			JSON.stringify({
				event: gameEventEnum.ERROR,
				message: `user with id (${user.userId}) didn't join game`
			})
		);
	}

	userWebSockets.add(user.username, socket);

	const currentTime = new Date();
	if (game.endTime < currentTime) {
		return userWebSockets.updateUser(user.username, {
			event: gameEventEnum.FINISHED_GAME,
			game
		});
	}

	const puzzle = await Puzzle.findById(game.puzzle).populate("author");

	if (!isPuzzleDto(puzzle)) {
		return userWebSockets.updateUser(user.username, {
			event: gameEventEnum.ERROR,
			message: "puzzle couldn't be found"
		});
	}

	userWebSockets.updateUser(user.username, {
		event: gameEventEnum.OVERVIEW_GAME,
		game,
		puzzle
	});
}
