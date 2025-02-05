import { z } from "zod";
import { registerSchema } from "types";
// import { fetchWithAuthenticationCookie } from "../../utils/fetch-with-authentication-cookie";
// import { apiUrls, buildApiUrl } from "@/config/api";

export const registerFormSchema = registerSchema;
// TODO: fix this, doesn't go to backend right now, it does, but doesn't update the form
// .superRefine(async (data, ctx) => {
// 	const { username } = data;

// 	const usernameValidationResult = registerSchema.pick({ username: true }).safeParse({ username });
// 	// If the username fails basic validation, skip the async check for availability
// 	if (!usernameValidationResult.success) {
// 		return;
// 	}

// 	const isAvailable = await fetchWithAuthenticationCookie(
// 		buildApiUrl(apiUrls.USERNAME_IS_AVAILABLE, { username })
// 	);

// 	if (!isAvailable) {
// 		ctx.addIssue({
// 			code: "custom",
// 			message: "Username is already taken",
// 			path: ["username"]
// 		});
// 	}
// });

export type RegisterForm = z.infer<typeof registerFormSchema>;
