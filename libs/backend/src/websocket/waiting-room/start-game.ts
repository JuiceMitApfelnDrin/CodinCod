import Puzzle, { PuzzleDocument } from "@/models/puzzle/puzzle.js";
import { updatePlayer } from "../common/update-player.js";
import Game from "@/models/game/game.js";
import { buildFrontendUrl, frontendUrls, GameEventEnum, PuzzleVisibilityEnum } from "types";
import { OpenGames } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";
import { findCreator } from "./find-creator.js";
import { removeGameFromGames } from "./remove-game-from-games.js";

export async function startGame({
	gameId,
	socket,
	games
}: {
	gameId: string;
	socket: WebSocket;
	games: OpenGames;
}) {
	const game = games[gameId];

	// [ongoing] create the game
	// [postpone] start countdown timer
	// players are trapped, hide the leave game option
	if (!game) {
		updatePlayer({
			socket,
			event: GameEventEnum.NONEXISTENT_GAME,
			message: `game with id (${gameId}), couldn't be found`
		});
		return;
	}

	// when game is started, removed from joinable games
	games[gameId];

	const playersInGame = Object.values(game);

	if (playersInGame.length <= 0) {
		removeGameFromGames({ gameId, games });

		updatePlayer({
			socket,
			event: GameEventEnum.NONEXISTENT_GAME,
			message: `game with id (${gameId}), couldn't be found`
		});
		return;
	}

	const creator = findCreator({ players: playersInGame });

	const randomPuzzles = await Puzzle.aggregate<PuzzleDocument>([
		{ $match: { visibility: PuzzleVisibilityEnum.APPROVED } },
		{ $sample: { size: 1 } }
	]).exec();

	if (randomPuzzles.length < 1) {
		updatePlayer({
			event: GameEventEnum.NOT_ENOUGH_GAMES,
			socket,
			message: "Create a puzzle and get it approved in order to play games"
		});
		return;
	}

	const randomPuzzle = randomPuzzles[0];

	const databaseGame = new Game({
		players: playersInGame.map((player) => player.userId),
		creator: creator.userId,
		puzzle: randomPuzzle._id
	});

	const newlyCreatedGame = await databaseGame.save();

	Object.values(game).forEach((item) => {
		updatePlayer({
			event: GameEventEnum.GO_TO_GAME,
			socket: item.socket,
			message: buildFrontendUrl(frontendUrls.MULTIPLAYER_ID, { id: newlyCreatedGame.id })
		});
	});

	removeGameFromGames({ gameId, games });
}
