import { z } from "zod";
import { registerSchema } from "types";
import { usernameIsAvailable } from "@/api/username-is-availability";

export const registerFormSchema = registerSchema.superRefine(async (data, ctx) => {
	const { username } = data;

	const usernameValidationResult = registerSchema.pick({ username: true }).safeParse({ username });
	// If the username fails basic validation, skip the async check for availability
	if (!usernameValidationResult.success) {
		return;
	}

	const isAvailable = await usernameIsAvailable(username);

	if (!isAvailable) {
		ctx.addIssue({
			code: "custom",
			message: "Username is already taken",
			path: ["username"]
		});
	}
});

export type RegisterForm = z.infer<typeof registerFormSchema>;
