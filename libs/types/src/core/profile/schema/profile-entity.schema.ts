import { z } from "zod";

export const profileEntitySchema = z.object({
	picture: z.string().trim().optional(),
	bio: z.string().trim().optional(),
	location: z.string().trim().optional(),
	socials: z.array(z.string().trim()).optional()
});
