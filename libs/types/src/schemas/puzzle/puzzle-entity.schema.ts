import { z } from "zod";
import { validatorEntitySchema } from "./validator.schema.js";
import { difficultySchema } from "./difficulty.schema.js";
import { puzzleVisibilitySchema } from "./puzzle-visibility.schema.js";
import { DifficultyEnum } from "../../enums/difficulty-enum.js";
import { PuzzleVisibilityEnum } from "../../enums/puzzle-visibility-enum.js";
import { PUZZLE_CONFIG } from "../../config/puzzle-config.js";
import { solutionSchema } from "./solution.schema.js";
import { userDtoSchema } from "../user/user-dto.schema.js";
import { acceptedDateSchema } from "../date/accepted-date.js";

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
	authorId: z
		.string()
		.or(userDtoSchema)
		.default(() => ""),
	validators: z.array(validatorEntitySchema).optional(),
	difficulty: difficultySchema.default(() => DifficultyEnum.INTERMEDIATE),
	// TODO: later not now !
	visibility: puzzleVisibilitySchema.default(() => PuzzleVisibilityEnum.DRAFT),
	createdAt: acceptedDateSchema.optional(),
	updatedAt: acceptedDateSchema.optional(),
	solution: solutionSchema,
	// TODO: later not now !
	puzzleMetrics: z.string().optional(),
	// TODO: later not now !
	tags: z.array(z.string()).optional()
});

export type PuzzleEntity = z.infer<typeof puzzleEntitySchema>;

export const createPuzzleSchema = puzzleEntitySchema.pick({ title: true });
export type CreatePuzzle = z.infer<typeof createPuzzleSchema>;

export const editPuzzleSchema = puzzleEntitySchema.pick({
	title: true,
	statement: true,
	constraints: true,
	validators: true,
	solution: true
});
export type EditPuzzle = z.infer<typeof editPuzzleSchema>;
