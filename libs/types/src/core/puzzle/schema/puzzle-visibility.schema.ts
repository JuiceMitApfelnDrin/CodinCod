import { z } from "zod";
import { puzzleVisibilityEnum } from "../enum/puzzle-visibility-enum.js";
import { getValues } from "../../../utils/functions/get-values.js";
import { puzzleResultInformationSchema } from "../../piston/schema/puzzle-result-information.schema.js";

export const puzzleVisibilitySchema = z.enum(getValues(puzzleVisibilityEnum));
export type PuzzleVisibility = z.infer<typeof puzzleVisibilitySchema>;

export function isPuzzleVisibilityState(data: unknown): data is PuzzleVisibility {
	return puzzleResultInformationSchema.safeParse(data).success;
}
