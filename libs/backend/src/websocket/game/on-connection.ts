import Game from "@/models/game/game.js";
import Puzzle from "@/models/puzzle/puzzle.js";
import { WebSocket } from "@fastify/websocket";
import { GameEventEnum } from "types";
import { updatePlayer } from "../common/update-player.js";
import { isValidObjectId } from "mongoose";

export async function onConnection({ socket, id }: { socket: WebSocket; id: string }) {
	if (!isValidObjectId(id)) {
		updatePlayer({
			socket,
			event: GameEventEnum.NONEXISTENT_GAME,
			message: "invalid id"
		});
		return;
	}

	const game = await Game.findById(id)
		.populate("creator")
		.populate("players")
		.populate("playerSubmissions")
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
		// TODO: return tournament standings or redirect to standings
		updatePlayer({
			socket,
			event: GameEventEnum.FINISHED_GAME,
			message: "game has finished"
		});
		return;
	}

	const puzzle = await Puzzle.findById(game.puzzle).populate("authorId");
	updatePlayer({
		socket,
		event: GameEventEnum.OVERVIEW_GAME,
		data: { game, puzzle }
	});

	console.log({ game });
}
