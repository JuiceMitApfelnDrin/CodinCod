import { z } from "zod";
import { userDtoSchema } from "./user-dto.schema.js";
import { userEntitySchema } from "./user-entity.schema.js";
import { activitySchema } from "../activity/activity.schema.js";

export const userActivitySchema = z.object({
	userId: userDtoSchema.shape._id,
	username: userEntitySchema.shape.username,
	activity: activitySchema
});

export type UserActivity = z.infer<typeof userActivitySchema>;

export function isUserActivity(
	supposedUserActivity: unknown
): supposedUserActivity is UserActivity {
	return userActivitySchema.safeParse(supposedUserActivity).success;
}
