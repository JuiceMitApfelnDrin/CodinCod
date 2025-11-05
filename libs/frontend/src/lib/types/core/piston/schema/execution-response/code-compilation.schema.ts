import { z } from "zod";

export const codeCompilationSchema = z.object({
	signal: z.string().or(z.null()),
	output: z.string(),
	stderr: z.string(),
	stdout: z.string(),
	code: z.number().or(z.null()),
});
