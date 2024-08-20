import { z } from "zod";
import { userEntitySchema } from "./user-entity.schema.js";

export const userDtoSchema = userEntitySchema.pick({
	username: true,
	createdAt: true
});
export type UserDto = z.infer<typeof userDtoSchema>;
