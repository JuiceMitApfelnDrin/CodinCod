import { z } from "zod";
import { validatorEntitySchema } from "./validator.schema.js";
import { difficultySchema } from "./difficulty.schema.js";
import { visibilitySchema } from "./visibility.schema.js";
import { DifficultyEnum } from "../../enums/difficulty-enum.js";
import { VisibilityEnum } from "../../enums/visibility-enum.js";
import { PUZZLE_CONFIG } from "../../config/puzzle-config.js";
import { solutionSchema } from "./solution.schema.js";
import { userDtoSchema } from "../user/user-dto.schema.js";
import { acceptedDateSchema } from "../../enums/accepted-date.js";

export const puzzleEntitySchema = z.object({
	title: z.string().min(PUZZLE_CONFIG.minTitleLength).max(PUZZLE_CONFIG.maxTitleLength),
	statement: z
		.string()
		.min(PUZZLE_CONFIG.minStatementLength)
		.max(PUZZLE_CONFIG.maxStatementLength)
		.optional(),
	constraints: z
		.string()
		.min(PUZZLE_CONFIG.minConstraintsLength)
		.max(PUZZLE_CONFIG.maxConstraintsLength)
		.optional(),
	authorId: z.string().or(userDtoSchema),
	validators: z.array(validatorEntitySchema).optional(),
	difficulty: difficultySchema.default(() => DifficultyEnum.INTERMEDIATE),
	// TODO: later not now !
	visibility: visibilitySchema.default(() => VisibilityEnum.DRAFT),
	createdAt: acceptedDateSchema.optional(),
	updatedAt: acceptedDateSchema.optional(),
	solution: solutionSchema,
	// TODO: later not now !
	puzzleMetrics: z.string().optional(),
	// TODO: later not now !
	tags: z.array(z.string()).optional()
});

export type PuzzleEntity = z.infer<typeof puzzleEntitySchema>;
