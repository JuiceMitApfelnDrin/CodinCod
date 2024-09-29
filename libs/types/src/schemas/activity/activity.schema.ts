import { z } from "zod";
import { acceptedDateSchema } from "../date/accepted-date.js";
import { ActivityTypeEnum } from "../../enums/activity-type-enum.js";

export const activitySchema = z.object({
	createdAt: acceptedDateSchema,
	_id: z.string().optional(),
	type: z.enum([
		ActivityTypeEnum.ADD_SUBMISSION,
		ActivityTypeEnum.CREATE_ACCOUNT,
		ActivityTypeEnum.CREATE_PUZZLE
	])
});

export type Activity = z.infer<typeof activitySchema>;

export function isActivity(supposedActivity: unknown): supposedActivity is Activity {
	return activitySchema.safeParse(supposedActivity).success;
}
