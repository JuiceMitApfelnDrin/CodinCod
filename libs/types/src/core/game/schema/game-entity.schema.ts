import { z } from "zod";
import { gameOptionsSchema } from "./options.schema.js";
import { userDtoSchema } from "../../user/schema/user-dto.schema.js";
import { puzzleDtoSchema } from "../../puzzle/schema/puzzle-dto.schema.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { submissionDtoSchema } from "../../submission/schema/submission-dto.schema.js";

export const gameEntitySchema = z.object({
	players: z.array(z.string().or(userDtoSchema)),
	creator: z.string().or(userDtoSchema),
	puzzle: z.string().or(puzzleDtoSchema),
	startTime: acceptedDateSchema,
	endTime: acceptedDateSchema,
	options: gameOptionsSchema,
	createdAt: acceptedDateSchema,
	playerSubmissions: z.array(z.string().or(submissionDtoSchema)).optional()
});
export type GameEntity = z.infer<typeof gameEntitySchema>;
