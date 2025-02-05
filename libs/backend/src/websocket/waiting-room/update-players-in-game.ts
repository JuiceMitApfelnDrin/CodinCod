import { OpenGame } from "@/types/games.js";
import { WebSocket } from "@fastify/websocket";
import { GameEventEnum, GameUserInfo } from "types";
import { updatePlayer } from "../common/update-player.js";
import { findCreator } from "./find-creator.js";

export function updatePlayersInGame({ game }: { game: OpenGame }) {
	const playersInGame = Object.values(game).map((value) => {
		let copiedValue: GameUserInfo & { socket?: WebSocket } = { ...value };
		delete copiedValue.socket;

		return copiedValue;
	});

	const creator = findCreator({ players: playersInGame });

	Object.values(game).forEach((userObj: GameUserInfo) => {
		updatePlayer({
			socket: userObj.socket,
			event: GameEventEnum.OVERVIEW_GAME,
			data: { users: playersInGame, creator: creator }
		});
	});
}
