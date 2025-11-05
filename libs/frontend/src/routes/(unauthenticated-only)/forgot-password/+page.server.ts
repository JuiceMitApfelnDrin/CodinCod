import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";

export const actions = {
	default: async ({ request, fetch }) => {
		const data = await request.formData();
		const email = data.get("email");

		if (!email || typeof email !== "string") {
			return fail(400, {
				error: "Email is required",
				errors: { email: "Please provide a valid email address" }
			});
		}

		try {
			const response = await fetch("/api/v1/password-reset/request", {
				method: "POST",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ email })
			});

			if (!response.ok) {
				const errorData = await response.json();
				return fail(response.status, {
					error: errorData.message || "Failed to send reset email",
					errors: errorData.errors
				});
			}

			return { success: true };
		} catch (error) {
			console.error("Password reset request error:", error);
			return fail(500, {
				error: "An unexpected error occurred. Please try again later."
			});
		}
	}
} satisfies Actions;
