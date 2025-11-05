import { z } from "zod";
import { isEmail } from "../../../utils/functions/is-email.js";
import { isUsername } from "../../../utils/functions/is-username.js";

export const identifierSchema = z.string().refine(
	(value) => {
		return isEmail(value) || isUsername(value);
	},
	{
		error: "Invalid username or email",
	},
);

export type Identifier = z.infer<typeof identifierSchema>;
