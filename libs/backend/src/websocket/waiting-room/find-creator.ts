import { GameUserInfo } from "types";

export function findCreator({ players }: { players: GameUserInfo[] }) {
	const creatorOfGame = players.reduce((oldestPlayer, currentPlayer) => {
		if (oldestPlayer.joinedAt < currentPlayer.joinedAt) {
			return oldestPlayer;
		} else {
			return currentPlayer;
		}
	});

	return creatorOfGame;
}
