import { z } from "zod";
import { puzzleEntitySchema } from "./puzzle-entity.schema.js";

const basePuzzleDtoSchema = puzzleEntitySchema;

export const puzzleDtoSchema = basePuzzleDtoSchema.extend({
	_id: z.string().optional()
});

export type PuzzleDto = z.infer<typeof puzzleDtoSchema>;

export function isPuzzleDto(data: unknown): data is PuzzleDto {
	return puzzleDtoSchema.safeParse(data).success;
}
