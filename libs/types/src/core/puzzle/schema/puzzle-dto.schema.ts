import { z } from 'zod';
import { puzzleEntitySchema } from './puzzle-entity.schema.js';
import { objectIdSchema } from '../../common/schema/object-id.js';
import { solutionSchema } from './solution.schema.js';
import {
	CommentDto,
	commentDtoSchema,
} from '../../comment/schema/comment-dto.schema.js';

const basePuzzleDtoSchema = puzzleEntitySchema;

export const puzzleDtoSchema = basePuzzleDtoSchema.extend({
	_id: objectIdSchema,
	solution: solutionSchema.optional(),
	comments: z.array(commentDtoSchema),
});

export type PuzzleDto = z.infer<typeof puzzleDtoSchema>;

export function isPuzzleDto(data: unknown): data is PuzzleDto {
	return puzzleDtoSchema.safeParse(data).success;
}
