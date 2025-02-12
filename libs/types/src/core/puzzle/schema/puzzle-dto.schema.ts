import { z } from "zod";
import { puzzleEntitySchema } from "./puzzle-entity.schema.js";
import { objectIdSchema } from "../../common/schema/object-id.js";

const basePuzzleDtoSchema = puzzleEntitySchema;

export const puzzleDtoSchema = basePuzzleDtoSchema.extend({
	_id: objectIdSchema
});

export type PuzzleDto = z.infer<typeof puzzleDtoSchema>;

export function isPuzzleDto(data: unknown): data is PuzzleDto {
	return puzzleDtoSchema.safeParse(data).success;
}
