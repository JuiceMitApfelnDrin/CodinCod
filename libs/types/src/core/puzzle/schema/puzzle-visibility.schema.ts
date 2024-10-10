import { z } from "zod";
import { PuzzleVisibilityEnum } from "../enum/puzzle-visibility-enum.js";

export const puzzleVisibilitySchema = z.enum([
	PuzzleVisibilityEnum.APPROVED,
	PuzzleVisibilityEnum.ARCHIVED,
	PuzzleVisibilityEnum.DRAFT,
	PuzzleVisibilityEnum.INACTIVE,
	PuzzleVisibilityEnum.REVIEW,
	PuzzleVisibilityEnum.REVISE
]);
export type PuzzleVisibility = z.infer<typeof puzzleVisibilitySchema>;
