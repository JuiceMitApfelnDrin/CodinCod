import { userEntitySchema } from "../../schemas/index.js";

export function isEmail(email: string): boolean {
	return userEntitySchema.pick({ email: true }).safeParse({ email }).success;
}
