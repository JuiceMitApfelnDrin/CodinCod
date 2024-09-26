import { z } from "zod";
import { DifficultyEnum } from "../../enums/difficulty-enum.js";

export const difficultySchema = z.enum([
	DifficultyEnum.BEGINNER,
	DifficultyEnum.INTERMEDIATE,
	DifficultyEnum.ADVANCED,
	DifficultyEnum.EXPERT
]);
export type Difficulty = z.infer<typeof difficultySchema>;
