import { z } from "zod";
import { userEntitySchema } from "./user-entity.schema.js";

const baseUserDtoSchema = userEntitySchema.pick({
	username: true,
	createdAt: true,
	profile: true
});

export const userDtoSchema = baseUserDtoSchema.extend({
	_id: z.string().optional()
});

export type UserDto = z.infer<typeof userDtoSchema>;

export function isUserDto(data: unknown): data is UserDto {
	console.log(userDtoSchema.safeParse(data).error);
	return userDtoSchema.safeParse(data).success;
}
