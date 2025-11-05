import { z } from "zod";

// Profile update schema with proper validation
export const updateProfileSchema = z.object({
	bio: z
		.string()
		.trim()
		.max(500, "Bio must be 500 characters or less")
		.optional(),
	location: z
		.string()
		.trim()
		.max(100, "Location must be 100 characters or less")
		.optional(),
	picture: z
		.string()
		.trim()
		.url("Profile picture must be a valid URL")
		.optional()
		.or(z.literal("")),
	socials: z
		.array(z.string().trim().url("Social link must be a valid URL"))
		.max(5, "Maximum of 5 social links allowed")
		.optional(),
});

export type UpdateProfile = z.infer<typeof updateProfileSchema>;
