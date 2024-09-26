import { z } from "zod";
import { userEntitySchema } from "../user/user-entity.schema.js";

export const registerSchema = userEntitySchema.pick({
	email: true,
	username: true,
	password: true
});
export type Register = z.infer<typeof registerSchema>;
