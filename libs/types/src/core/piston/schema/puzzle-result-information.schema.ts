import { z } from "zod";
import { puzzleResultSchema } from "./puzzle-result.js";

export const puzzleResultInformationSchema = z.object({
	result: puzzleResultSchema,
	amountOfSuccessfulTests: z.number()
});

export type PuzzleResultInformation = z.infer<typeof puzzleResultInformationSchema>;
