import { z } from "zod";
import { identifierSchema } from "./identifier.schema.js";
import { userEntitySchema } from "../user/user-entity.schema.js";

// export const loginSchema = userEntitySchema.pick({
//     password: true
// }).extend({
//     identifier: identifierSchema
// });
export const loginSchema = z.object({
	password: userEntitySchema.shape.password,
	identifier: identifierSchema
});
export type LoginInput = z.infer<typeof loginSchema>;
