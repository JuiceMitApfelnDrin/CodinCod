import { z } from "zod";

export const userProfileSchema = z.object({
	picture: z.ostring(),
	bio: z.ostring(),
	location: z.ostring(),
	socials: z.array(z.string()).nonempty().optional()
});

export type UserProfile = z.infer<typeof userProfileSchema>;
