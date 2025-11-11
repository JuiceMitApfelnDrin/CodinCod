import type { z } from "zod";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { gameEntitySchema } from "./game-entity.schema.js";

const baseGameDtoSchema = gameEntitySchema;

export const gameDtoSchema = baseGameDtoSchema.extend({
	_id: objectIdSchema
});

export type GameDto = z.infer<typeof gameDtoSchema>;

export function isGameDto(data: unknown): data is GameDto {
	return gameDtoSchema.safeParse(data).success;
}
