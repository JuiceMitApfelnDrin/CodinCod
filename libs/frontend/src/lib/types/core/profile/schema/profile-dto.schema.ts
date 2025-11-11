import type { z } from "zod";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { profileEntitySchema } from "./profile-entity.schema.js";

const baseProfileDtoSchema = profileEntitySchema;

export const profileDtoSchema = baseProfileDtoSchema.extend({
	_id: objectIdSchema
});

export type ProfileDto = z.infer<typeof profileDtoSchema>;

export function isProfileDto(data: unknown): data is ProfileDto {
	return profileDtoSchema.safeParse(data).success;
}
