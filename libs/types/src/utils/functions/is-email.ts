import { userEntitySchema } from "../../core/user/schema/user-entity.schema.js";

export function isEmail(email: string): boolean {
	return userEntitySchema.pick({ email: true }).safeParse({ email }).success;
}
