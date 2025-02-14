import { z } from "zod";
import { puzzleResultSchema } from "../../piston/schema/puzzle-result.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { userDtoSchema } from "../../user/schema/user-dto.schema.js";
import { puzzleLanguage, puzzleLanguageVersion } from "../../puzzle/schema/puzzle-language.js";
import { puzzleDtoSchema } from "../../puzzle/schema/puzzle-dto.schema.js";
import { objectIdSchema } from "../../common/schema/object-id.js";

export const submissionEntitySchema = z.object({
	code: z.string().optional(),
	language: puzzleLanguage,
	languageVersion: puzzleLanguageVersion,
	createdAt: acceptedDateSchema.default(() => new Date()),
	puzzle: objectIdSchema.or(puzzleDtoSchema),
	result: puzzleResultSchema,
	user: objectIdSchema.or(userDtoSchema)
});
export type SubmissionEntity = z.infer<typeof submissionEntitySchema>;
