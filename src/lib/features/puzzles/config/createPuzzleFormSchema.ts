import { z } from "zod";

export const createPuzzleFormSchema = z.object({
	title: z.string().min(2).max(50),
	statement: z.string().min(10).max(1024)
});

export type CreatePuzzleFormSchema = typeof createPuzzleFormSchema;
