import { z } from "zod";
import { checkUsernameAvailability } from "../api/check-username-availability";
import { registerSchema } from "types";

export const registerFormSchema = registerSchema.refine(
	async (data) => {
		const { username } = data;

		if (!username) return false;

		const isAvailable = await checkUsernameAvailability(username);

		return isAvailable;
	},
	{
		message: "Username is already taken",
		path: ["username"]
	}
);

export type RegisterForm = z.infer<typeof registerFormSchema>;
