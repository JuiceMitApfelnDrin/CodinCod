import { PuzzleDto } from "../../puzzle/schema/puzzle-dto.schema.js";
import { GameDto } from "../schema/game-dto.schema.js";

export type GameState = {
	game: GameDto | undefined;
	puzzle: PuzzleDto | undefined;
	errorMessage: string;
};
