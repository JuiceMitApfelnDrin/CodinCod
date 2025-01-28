import { z } from "zod";
import { profileEntitySchema } from "./profile-entity.schema.js";

const baseProfileDtoSchema = profileEntitySchema;

export const profileDtoSchema = baseProfileDtoSchema.extend({
	_id: z.string().optional()
});

export type ProfileDto = z.infer<typeof profileDtoSchema>;

export function isProfileDto(data: unknown): data is ProfileDto {
	return profileDtoSchema.safeParse(data).success;
}
