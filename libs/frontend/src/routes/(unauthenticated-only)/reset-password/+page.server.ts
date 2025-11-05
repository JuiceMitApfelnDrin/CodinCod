import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions = {
	default: async ({ request, fetch }) => {
		const data = await request.formData();
		const token = data.get("token");
		const password = data.get("password");
		const confirmPassword = data.get("confirmPassword");

		if (!token || typeof token !== "string") {
			return fail(400, {
				error: "Invalid reset token"
			});
		}

		if (!password || typeof password !== "string") {
			return fail(400, {
				error: "Password is required",
				errors: { password: "Please provide a new password" }
			});
		}

		if (password.length < 8) {
			return fail(400, {
				error: "Password too short",
				errors: { password: "Password must be at least 8 characters" }
			});
		}

		if (password !== confirmPassword) {
			return fail(400, {
				error: "Passwords do not match"
			});
		}

		try {
			const response = await fetch("/api/v1/password-reset/reset", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ token, password })
			});

			if (!response.ok) {
				const errorData = await response.json();
				return fail(response.status, {
					error:
						errorData.error || errorData.message || "Failed to reset password",
					errors: errorData.errors
				});
			}

			return { success: true };
		} catch (error) {
			console.error("Password reset error:", error);
			return fail(500, {
				error: "An unexpected error occurred. Please try again later."
			});
		}
	}
} satisfies Actions;
