import { GameUserInfo } from "types";

export function updatePlayersInGame({ game }: { game: Map<string, GameUserInfo> }) {
	const currentGame = JSON.stringify({
		game: Array.from(game.entries(), ([_, value]) => {
			const userGameInfoWithoutSocket = value;
			delete userGameInfoWithoutSocket.socket;

			return userGameInfoWithoutSocket;
		})
	});

	game.forEach((userObj) => {
		userObj.socket.send(currentGame);
	});
}
