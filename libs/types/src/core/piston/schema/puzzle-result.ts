import { z } from "zod";
import { PuzzleResultEnum } from "../../enums/puzzle-result-enum.js";

export const puzzleResultSchema = z.enum([
	PuzzleResultEnum.ERROR,
	PuzzleResultEnum.SUCCESS,

	// TODO: probably want to get rid of unknown situations eventually :)
	PuzzleResultEnum.UNKNOWN
]);
export type PuzzleResult = z.infer<typeof puzzleResultSchema>;
