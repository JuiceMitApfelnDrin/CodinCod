import { z } from "zod";

export const puzzleLanguage = z.string();
export const puzzleLanguageVersion = z.string();
export type PuzzleLanguage = z.infer<typeof puzzleLanguage>;
export type PuzzleLanguageVersion = z.infer<typeof puzzleLanguageVersion>;
