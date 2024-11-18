import { z } from "zod";
import { gameEntitySchema } from "./game-entity.schema.js";

const baseGameDtoSchema = gameEntitySchema;

export const gameDtoSchema = baseGameDtoSchema.extend({
	_id: z.string().optional()
});

export type GameDto = z.infer<typeof gameDtoSchema>;

export function isGameDto(data: unknown): data is GameDto {
	return gameDtoSchema.safeParse(data).success;
}
