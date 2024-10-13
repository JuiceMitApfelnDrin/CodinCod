import { GameUserInfo } from "types";

export function updatePlayersInGame({ game }: { game: Map<string, GameUserInfo> }) {
	const currentGame = JSON.stringify({
		game: Array.from(game.entries(), ([key, value]) => {
			return { username: key, joinedAt: value.joinedAt };
		})
	});

	game.forEach((userObj) => {
		userObj.socket.send(currentGame);
	});
}
