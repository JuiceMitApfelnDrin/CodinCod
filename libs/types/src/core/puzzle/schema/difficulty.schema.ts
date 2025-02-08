import { z } from "zod";
import { DifficultyEnum } from "../enum/difficulty-enum.js";
import { getValues } from "../../../utils/functions/get-values.js";

export const difficultySchema = z.enum(getValues(DifficultyEnum));

export type Difficulty = z.infer<typeof difficultySchema>;
