import { z } from "zod";

export const puzzleFormSchema = z.object({
	title: z.string().min(4).max(128),
	description: z.string().min(1).nullable().default(null),
	constraints: z.string().nullable().default(null),
	difficulty: z
		.enum(["beginner", "easy", "medium", "hard", "expert"])
		.nullable()
		.default(null),
	tags: z.array(z.string()).nullable().default(null),
	validators: z
		.array(
			z.object({
				input: z.string(),
				output: z.string()
			})
		)
		.nullable()
		.default(null)
});

export type PuzzleForm = z.infer<typeof puzzleFormSchema>;
