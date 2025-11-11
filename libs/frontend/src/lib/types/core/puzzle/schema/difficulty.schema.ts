import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";
import { DifficultyEnum } from "../enum/difficulty-enum.js";

export const difficultySchema = z.enum(getValues(DifficultyEnum));

export type Difficulty = z.infer<typeof difficultySchema>;
