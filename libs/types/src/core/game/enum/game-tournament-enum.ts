export const gameTournamentStyleEnum = {
	BEST_OF_THREE: "best_of_three", // Multiple rounds, win 2 out of 3
	ELIMINATION: "elimination", // Tournament bracket style
	BATTLE_ROYALE: "battle_royale", // Many players, last one standing
} as const;
