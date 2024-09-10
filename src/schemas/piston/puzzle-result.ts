import { z } from "zod";
import { PuzzleResultEnum } from "../../enums/puzzle-result-enum.js";

export const puzzleResultSchema = z.enum([
	PuzzleResultEnum.ERROR,
	PuzzleResultEnum.SUCCESS,
	PuzzleResultEnum.UNKNOWN
]);
export type PuzzleResult = z.infer<typeof puzzleResultSchema>;
