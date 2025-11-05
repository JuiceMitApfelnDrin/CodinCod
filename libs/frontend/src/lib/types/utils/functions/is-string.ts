import { z } from "zod";

export function isString(supposedString: unknown): supposedString is string {
	return z.string().safeParse(supposedString).success;
}
