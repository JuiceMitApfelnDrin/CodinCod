import { z } from "zod";

export const codeRunSchema = z.object({
	signal: z.string().or(z.null()),
	output: z.string(),
	stderr: z.string(),
	stdout: z.string(),
	code: z.number().or(z.null()),
});
