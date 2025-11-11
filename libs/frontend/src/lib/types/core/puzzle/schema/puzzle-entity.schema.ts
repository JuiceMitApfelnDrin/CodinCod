import { z } from "zod";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { userDtoSchema } from "../../user/schema/user-dto.schema.js";
import { PUZZLE_CONFIG } from "../config/puzzle-config.js";
import { DifficultyEnum } from "../enum/difficulty-enum.js";
import { puzzleVisibilityEnum } from "../enum/puzzle-visibility-enum.js";
import { difficultySchema } from "./difficulty.schema.js";
import { puzzleVisibilitySchema } from "./puzzle-visibility.schema.js";
import { solutionSchema } from "./solution.schema.js";
import { tagSchema } from "./tag.schema.js";
import { validatorEntitySchema } from "./validator.schema.js";

export const puzzleEntitySchema = z.object({
	title: z
		.string()
		.min(PUZZLE_CONFIG.minTitleLength)
		.max(PUZZLE_CONFIG.maxTitleLength),
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
	author: objectIdSchema.or(userDtoSchema).default(""),
	validators: z.array(validatorEntitySchema).optional(),
	difficulty: difficultySchema.prefault(DifficultyEnum.INTERMEDIATE), // TODO: later not now !
	visibility: puzzleVisibilitySchema.prefault(puzzleVisibilityEnum.DRAFT),
	createdAt: acceptedDateSchema.optional(),
	updatedAt: acceptedDateSchema.optional(),
	solution: solutionSchema,
	puzzleMetrics: objectIdSchema.optional(), // TODO: later not now !
	tags: z.array(tagSchema).optional(), // TODO: later not now !
	comments: z.array(objectIdSchema).default([]).optional(),
	moderationFeedback: z.string().optional()
});

export type PuzzleEntity = z.infer<typeof puzzleEntitySchema>;

export const createPuzzleSchema = puzzleEntitySchema.pick({
	title: true
});
export type CreatePuzzle = z.infer<typeof createPuzzleSchema>;

export const createPuzzleBackendSchema = puzzleEntitySchema.pick({
	title: true,
	author: true
});
export type CreatePuzzleBackend = z.infer<typeof createPuzzleBackendSchema>;

export const editPuzzleSchema = puzzleEntitySchema
	.pick({
		title: true,
		statement: true,
		constraints: true,
		validators: true,
		solution: true,
		visibility: true,
		createdAt: true,
		updatedAt: true,
		author: true
	})
	.extend({
		// Make solution optional with default for edit form
		solution: solutionSchema
			.optional()
			.prefault({ code: "", programmingLanguage: undefined })
	});
export type EditPuzzle = z.infer<typeof editPuzzleSchema>;

export function isEditPuzzle(data: unknown): data is EditPuzzle {
	return editPuzzleSchema.safeParse(data).success;
}
