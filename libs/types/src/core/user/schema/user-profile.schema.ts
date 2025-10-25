import { z } from "zod";

export const userProfileSchema = z.object({
	picture: z.string().optional(),
	bio: z.string().optional(),
	location: z.string().optional(),
	socials: z.tuple([z.string()], z.string()).optional(),
});

export type UserProfile = z.infer<typeof userProfileSchema>;
