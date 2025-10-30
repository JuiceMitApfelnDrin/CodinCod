import { z } from "zod";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { userDtoSchema } from "../../user/schema/user-dto.schema.js";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { programmingLanguageDtoSchema } from "../../programming-language/schema/programming-language-dto.schema.js";
import { puzzleDtoSchema } from "../../puzzle/schema/puzzle-dto.schema.js";
import { puzzleResultInformationSchema } from "../../piston/schema/puzzle-result-information.schema.js";

export const submissionEntitySchema = z.object({
	code: z.string().optional(),
	codeLength: z.number().optional(),
	programmingLanguage: objectIdSchema.or(programmingLanguageDtoSchema),
	createdAt: acceptedDateSchema.prefault(() => new Date()),
	puzzle: objectIdSchema.or(puzzleDtoSchema),
	result: puzzleResultInformationSchema,
	user: objectIdSchema.or(userDtoSchema),
});
export type SubmissionEntity = z.infer<typeof submissionEntitySchema>;
