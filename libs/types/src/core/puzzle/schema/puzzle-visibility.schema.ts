import { z } from "zod";
import { puzzleVisibilityEnum } from "../enum/puzzle-visibility-enum.js";
import { getValues } from "../../../utils/functions/get-values.js";

export const puzzleVisibilitySchema = z.enum(getValues(puzzleVisibilityEnum));
export type PuzzleVisibility = z.infer<typeof puzzleVisibilitySchema>;
