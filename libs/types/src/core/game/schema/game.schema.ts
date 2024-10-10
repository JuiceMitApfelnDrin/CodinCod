import { z } from "zod";
import { userDtoSchema } from "../../user/schema/user-dto.schema.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { gameConfigSchema } from "./game-config.schema.js";
import { puzzleDtoSchema } from "../../puzzle/schema/puzzle-dto.schema.js";

export const gameEntitySchema = z.object({
	players: z.array(z.string().or(userDtoSchema)),
	creator: z.string().optional().or(userDtoSchema.optional()),
	puzzle: z.string().or(puzzleDtoSchema),
	startTime: acceptedDateSchema,
	endTime: acceptedDateSchema,
	config: gameConfigSchema,
	createdAt: acceptedDateSchema
});
export type GameEntity = z.infer<typeof gameEntitySchema>;
