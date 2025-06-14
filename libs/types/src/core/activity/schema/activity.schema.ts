import { z } from "zod";
import { activityTypeEnum, activityTypes } from "../enum/activity-type-enum.js";
import { getValues } from "../../../utils/functions/get-values.js";
import { acceptedDateSchema } from "../../common/schema/accepted-date.js";
import { objectIdSchema } from "../../common/schema/object-id.js";

export const activitySchema = z.object({
	createdAt: acceptedDateSchema,
	_id: objectIdSchema,
	type: activityTypes,
});

export type Activity = z.infer<typeof activitySchema>;

export function isActivity(
	supposedActivity: unknown,
): supposedActivity is Activity {
	return activitySchema.safeParse(supposedActivity).success;
}
