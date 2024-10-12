import Puzzle, { PuzzleDocument } from "@/models/puzzle/puzzle.js";
import { updatePlayer } from "./update-player.js";
import Game from "@/models/game/game.js";
import { GameEventEnum } from "types";
import { WebSocketGamesMap } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";

export async function startGame({
	gameId,
	socket,
	games
}: {
	gameId: string;
	socket: WebSocket;
	games: WebSocketGamesMap;
}) {
	console.log("start the game");

	const game = games.get(gameId);

	// [ongoing] create the game
	// [postpone] start countdown timer
	// players are trapped, hide the leave game option
	if (!game) {
		updatePlayer({ socket, event: GameEventEnum.NONEXISTENT_GAME, message: "no game yo!" });
		return;
	}
	console.log({ game });
	const playersInGame = Array.from(game.values());

	console.log({ playersInGame });

	const creator = playersInGame.reduce((oldestPlayer, currentPlayer) => {
		if (oldestPlayer.joinedAt < currentPlayer.joinedAt) {
			return oldestPlayer;
		} else {
			return currentPlayer;
		}
	}, playersInGame[0]);

	const randomPuzzles = await Puzzle.aggregate<PuzzleDocument>([{ $sample: { size: 1 } }]).exec();
	const randomPuzzle = randomPuzzles[0];

	console.log({ creator });

	const databaseGame = new Game({
		players: playersInGame.map((player) => player.userId),
		creator,
		puzzle: randomPuzzle._id
	});

	console.log({ databaseGame });
}
