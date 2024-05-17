import { z } from "zod";

export const editPuzzleFormSchema = z.object({
	id: z.string(),
	title: z.string(),
	statement: z.string(),
	constraints: z.string().optional(),
	author_id: z.string(),
	validators: z
		.array(
			z.object({
				input: z.string(),
				output: z.string()
			})
		)
		.optional(),
	types: z.array(z.union([z.literal(1), z.literal(2), z.literal(3)])).optional(),
	difficulty: z
		.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
		.optional(),
	updated_at: z.date(),
	created_at: z.date()
});

export type EditPuzzleFormSchema = typeof editPuzzleFormSchema;
