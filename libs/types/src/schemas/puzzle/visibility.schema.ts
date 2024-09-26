import { z } from "zod";
import { VisibilityEnum } from "../../enums/visibility-enum.js";

export const visibilitySchema = z.enum([
	VisibilityEnum.APPROVED,
	VisibilityEnum.ARCHIVED,
	VisibilityEnum.DRAFT,
	VisibilityEnum.INACTIVE,
	VisibilityEnum.REVIEW,
	VisibilityEnum.REVISE
]);
export type Visibility = z.infer<typeof visibilitySchema>;
