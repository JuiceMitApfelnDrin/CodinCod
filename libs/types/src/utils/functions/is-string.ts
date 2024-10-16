import { z } from "zod";

export function isString(supposedString: any): supposedString is string {
	return z.string().safeParse(supposedString).success;
}
