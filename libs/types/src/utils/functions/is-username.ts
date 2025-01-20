import { userEntitySchema } from "../../core/index.js";

export function isUsername(username: string): boolean {
	return userEntitySchema.pick({ username: true }).safeParse({ username }).success;
}
