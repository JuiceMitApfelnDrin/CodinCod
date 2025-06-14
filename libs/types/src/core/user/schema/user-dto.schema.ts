import type { z } from "zod";
import { userEntitySchema } from "./user-entity.schema.js";
import { objectIdSchema } from "../../common/schema/object-id.js";

const baseUserDtoSchema = userEntitySchema.pick({
	username: true,
	createdAt: true,
	profile: true,
});

export const userDtoSchema = baseUserDtoSchema.extend({
	_id: objectIdSchema,
});

export type UserDto = z.infer<typeof userDtoSchema>;

export function isUserDto(data: unknown): data is UserDto {
	return userDtoSchema.safeParse(data).success;
}
