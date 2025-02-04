import { z } from "zod";

export const puzzleLanguage = z.string();
export type PuzzleLanguage = z.infer<typeof puzzleLanguage>;
