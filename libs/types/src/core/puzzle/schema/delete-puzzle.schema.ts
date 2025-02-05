import { z } from "zod";
import { puzzleDtoSchema } from "./puzzle-dto.schema.js";

export const deletePuzzleSchema = z.object({
	id: puzzleDtoSchema.shape._id.unwrap()
});

export type DeletePuzzle = z.infer<typeof deletePuzzleSchema>;

export function isDeletePuzzle(data: unknown): data is DeletePuzzle {
	return deletePuzzleSchema.safeParse(data).success;
}
