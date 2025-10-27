import { z } from "zod";
import { gameOptionsSchema } from "./game-options.schema.js";
import { userDtoSchema } from "../../user/schema/user-dto.schema.js";
import { puzzleDtoSchema } from "../../puzzle/schema/puzzle-dto.schema.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { submissionDtoSchema } from "../../submission/schema/submission-dto.schema.js";
import { objectIdSchema } from "../../common/schema/object-id.js";

export const gameEntitySchema = z.object({
	players: z.array(objectIdSchema.or(userDtoSchema)),
	owner: objectIdSchema.or(userDtoSchema),
	puzzle: objectIdSchema.or(puzzleDtoSchema),
	startTime: acceptedDateSchema,
	endTime: acceptedDateSchema,
	options: gameOptionsSchema,
	createdAt: acceptedDateSchema,
	playerSubmissions: z
		.array(objectIdSchema.or(submissionDtoSchema))
		.prefault([]),
});
export type GameEntity = z.infer<typeof gameEntitySchema>;
