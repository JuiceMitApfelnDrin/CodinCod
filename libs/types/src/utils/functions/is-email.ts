import { userEntitySchema } from "../../core/index.js";

export function isEmail(email: string): boolean {
	return userEntitySchema.pick({ email: true }).safeParse({ email }).success;
}
