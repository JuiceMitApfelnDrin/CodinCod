import type { z } from "zod";
import { userEntitySchema } from "../../user/schema/user-entity.schema.js";

export const registerSchema = userEntitySchema.pick({
	email: true,
	username: true,
	password: true,
});
export type Register = z.infer<typeof registerSchema>;
