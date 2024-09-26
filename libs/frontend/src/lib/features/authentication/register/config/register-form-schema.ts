import { z } from "zod";
import { checkUsernameAvailability } from "../api/check-username-availability";
import { registerSchema } from "types";

export const registerFormSchema = registerSchema.superRefine(async (data, ctx) => {
	const { username } = data;

	const usernameValidationResult = registerSchema.pick({ username: true }).safeParse({ username });
	// If the username fails basic validation, skip the async check for availability
	if (!usernameValidationResult.success) {
		return;
	}

	const isAvailable = await checkUsernameAvailability(username);

	if (!isAvailable) {
		ctx.addIssue({
			path: ["username"],
			message: "Username is already taken",
			code: "custom"
		});
	}
});

export type RegisterForm = z.infer<typeof registerFormSchema>;
