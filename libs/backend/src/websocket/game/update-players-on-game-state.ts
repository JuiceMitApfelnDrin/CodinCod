import Game from "@/models/game/game.js";
import { WebSocket } from "@fastify/websocket";
import { isValidObjectId } from "mongoose";
import { updatePlayers } from "./update-players.js";

export async function updatePlayersOnGameState({
	id,
	players
}: {
	id: string;
	players: WebSocket[];
}) {
	if (!isValidObjectId(id)) {
		updatePlayers({
			sockets: players,
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
		updatePlayers({
			sockets: players,
			message: "game couldn't be found"
		});
		return;
	}

	updatePlayers({
		sockets: players,
		data: { game }
	});
}
