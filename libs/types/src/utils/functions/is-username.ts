import { userEntitySchema } from "../../core/user/schema/user-entity.schema.js";

export function isUsername(username: string): boolean {
	return userEntitySchema.pick({ username: true }).safeParse({ username })
		.success;
}
