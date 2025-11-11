import { z } from "zod";
import { userEntitySchema } from "../../user/schema/user-entity.schema.js";
import { identifierSchema } from "./identifier.schema.js";

export const loginSchema = z.object({
	password: userEntitySchema.shape.password,
	identifier: identifierSchema
});
export type Login = z.infer<typeof loginSchema>;
