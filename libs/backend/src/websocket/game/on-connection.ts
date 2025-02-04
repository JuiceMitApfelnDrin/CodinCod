import Game from "@/models/game/game.js";
import Puzzle from "@/models/puzzle/puzzle.js";
import { WebSocket } from "@fastify/websocket";
import { GameEventEnum } from "types";
import { updatePlayer } from "../common/update-player.js";
import { isValidObjectId } from "mongoose";
import { addPlayerToPlayers } from "../common/add-player-to-players.js";

export async function onConnection({
	socket,
	id,
	players
}: {
	socket: WebSocket;
	id: string;
	players: WebSocket[];
}) {
	if (!isValidObjectId(id)) {
		updatePlayer({
			socket,
			event: GameEventEnum.NONEXISTENT_GAME,
			message: "invalid id"
		});
		return;
	}

	addPlayerToPlayers({ players, playerSocketToAdd: socket });

	const game = await Game.findById(id)
		.populate("creator")
		.populate("players")
		/* deeply populated, for every playerSubmission populate the userId field with a user */
		.populate({
			path: "playerSubmissions",
			populate: {
				path: "userId"
			}
		})
		.exec();

	if (!game) {
		updatePlayer({
			socket,
			event: GameEventEnum.NONEXISTENT_GAME,
			message: "game couldn't be found"
		});
		return;
	}

	const currentTime = new Date();
	if (game.endTime < currentTime) {
		updatePlayer({
			socket,
			event: GameEventEnum.FINISHED_GAME,
			data: { game }
		});
		return;
	}

	const puzzle = await Puzzle.findById(game.puzzle).populate("authorId");

	if (puzzle) {
		updatePlayer({
			socket,
			event: GameEventEnum.OVERVIEW_GAME,
			data: { game, puzzle }
		});
	}
}
