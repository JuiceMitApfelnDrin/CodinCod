import { z } from "zod";
import { ActivityTypeEnum } from "../enum/activity-type-enum.js";
import { acceptedDateSchema } from "../../common/index.js";
import { getValues } from "../../../utils/functions/getValues.js";

export const activitySchema = z.object({
	createdAt: acceptedDateSchema,
	_id: z.string().optional(),
	type: z.enum(getValues(ActivityTypeEnum))
});

export type Activity = z.infer<typeof activitySchema>;

export function isActivity(supposedActivity: unknown): supposedActivity is Activity {
	return activitySchema.safeParse(supposedActivity).success;
}
