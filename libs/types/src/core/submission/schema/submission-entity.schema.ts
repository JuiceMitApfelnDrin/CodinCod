import { z } from "zod";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { userDtoSchema } from "../../user/schema/user-dto.schema.js";
import { puzzleLanguage, puzzleLanguageVersion } from "../../puzzle/schema/puzzle-language.js";
import { puzzleDtoSchema } from "../../puzzle/schema/puzzle-dto.schema.js";
import { puzzleResultInformationSchema } from "../../piston/schema/puzzle-result-information.schema.js";

export const submissionEntitySchema = z.object({
	code: z.string().optional(),
	language: puzzleLanguage,
	languageVersion: puzzleLanguageVersion,
	createdAt: acceptedDateSchema.default(() => new Date()),
	puzzle: z.string().or(puzzleDtoSchema),
	resultInfo: puzzleResultInformationSchema,
	user: z.string().or(userDtoSchema)
});
export type SubmissionEntity = z.infer<typeof submissionEntitySchema>;
