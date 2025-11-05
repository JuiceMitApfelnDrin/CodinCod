import { z } from "zod";
import { objectIdSchema } from "../../common/schema/object-id.js";

export const deletePuzzleSchema = z.object({
	id: objectIdSchema,
});

export type DeletePuzzle = z.infer<typeof deletePuzzleSchema>;

export function isDeletePuzzle(data: unknown): data is DeletePuzzle {
	return deletePuzzleSchema.safeParse(data).success;
}
