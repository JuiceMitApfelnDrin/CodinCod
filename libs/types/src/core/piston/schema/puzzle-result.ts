import { z } from "zod";
import { PuzzleResultEnum } from "../../puzzle/index.js";
import { getValues } from "../../../utils/functions/getValues.js";

// TODO: find a better name for this schema
export const puzzleResultSchema = z.enum(getValues(PuzzleResultEnum));
export type PuzzleResult = z.infer<typeof puzzleResultSchema>;
