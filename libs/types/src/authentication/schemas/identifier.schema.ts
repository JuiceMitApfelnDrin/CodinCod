import { z } from "zod";
import { isEmail, isUsername } from "../../utils/index.js";

export const identifierSchema = z.string().refine(
	(value) => {
		return isEmail(value) || isUsername(value);
	},
	{
		message: "Invalid username or email"
	}
);
export type Identifier = z.infer<typeof identifierSchema>;
