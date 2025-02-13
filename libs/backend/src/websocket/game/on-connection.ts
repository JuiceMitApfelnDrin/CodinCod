import Game from "@/models/game/game.js";
import Puzzle from "@/models/puzzle/puzzle.js";
import { WebSocket } from "@fastify/websocket";
import { AuthenticatedInfo, GameEventEnum, ObjectId } from "types";
import { PlayGame } from "./play-game.js";

export async function onConnection(
	playGame: PlayGame,
	user: AuthenticatedInfo,
	gameId: ObjectId,
	socket: WebSocket
) {
	playGame.addUserToUsers(user.username, socket);

	const game = await Game.findById(gameId)
		.populate("creator")
		.populate("players")
		/* deeply populated, for every playerSubmission populate the userId field with a user */
		.populate({
			path: "playerSubmissions",
			populate: {
				path: "user"
			}
		})
		.exec();

	if (!game) {
		const data = JSON.stringify({
			event: GameEventEnum.NONEXISTENT_GAME,
			message: "game couldn't be found"
		});

		playGame.updateUser(user.username, data);
		return;
	}

	const currentTime = new Date();
	if (game.endTime < currentTime) {
		playGame.updateUser(
			user.username,
			JSON.stringify({
				event: GameEventEnum.FINISHED_GAME,
				game
			})
		);
		return;
	}

	const puzzle = await Puzzle.findById(game.puzzle).populate("author");

	if (puzzle) {
		const data = JSON.stringify({
			event: GameEventEnum.OVERVIEW_GAME,
			game,
			puzzle
		});

		playGame.updateUser(user.username, data);
	}
}
