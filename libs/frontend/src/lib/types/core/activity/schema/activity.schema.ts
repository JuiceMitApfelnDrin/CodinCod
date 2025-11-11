import { z } from "zod";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { objectIdSchema } from "../../common/schema/object-id.js";
import { activityTypes } from "../enum/activity-type-enum.js";

export const activitySchema = z.object({
	createdAt: acceptedDateSchema,
	_id: objectIdSchema,
	type: activityTypes
});

export type Activity = z.infer<typeof activitySchema>;

export function isActivity(
	supposedActivity: unknown
): supposedActivity is Activity {
	return activitySchema.safeParse(supposedActivity).success;
}
