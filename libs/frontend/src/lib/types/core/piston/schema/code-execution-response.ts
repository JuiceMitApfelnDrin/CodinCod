import { z } from "zod";
import { codeRunSchema } from "./execution-response/code-run.schema.js";
import { codeCompilationSchema } from "./execution-response/code-compilation.schema.js";
import { puzzleResultInformationSchema } from "./puzzle-result-information.schema.js";
import { errorResponseSchema } from "../../common/schema/error-response.schema.js";

export const codeExecutionSuccessResponseSchema = z.object({
	run: codeRunSchema,
	compile: codeCompilationSchema.optional(),
	puzzleResultInformation: puzzleResultInformationSchema,
});
export type CodeExecutionSuccessResponse = z.infer<
	typeof codeExecutionSuccessResponseSchema
>;
export function isCodeExecutionSuccessResponse(
	data: unknown,
): data is CodeExecutionSuccessResponse {
	return codeExecutionSuccessResponseSchema.safeParse(data).success;
}

export const codeExecutionResponseSchema = errorResponseSchema.or(
	codeExecutionSuccessResponseSchema,
);

export type CodeExecutionResponse = z.infer<typeof codeExecutionResponseSchema>;
