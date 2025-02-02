import { z } from "zod";
import { getValues } from "../../../utils/functions/getValues.js";
import { PuzzleResultEnum } from "../../puzzle/enum/puzzle-result-enum.js";

// TODO: find a better name for this schema
export const puzzleResultSchema = z.enum(getValues(PuzzleResultEnum));
export type PuzzleResult = z.infer<typeof puzzleResultSchema>;
