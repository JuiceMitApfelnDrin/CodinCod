import { z } from "zod";
import { PuzzleVisibilityEnum } from "../enum/puzzle-visibility-enum.js";
import { getValues } from "../../../utils/functions/getValues.js";

export const puzzleVisibilitySchema = z.enum(getValues(PuzzleVisibilityEnum));
export type PuzzleVisibility = z.infer<typeof puzzleVisibilitySchema>;
