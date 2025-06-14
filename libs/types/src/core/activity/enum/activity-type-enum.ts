import { z } from "zod";
import { getValues } from "../../../utils/functions/get-values.js";

export const activityTypeEnum = {
	CREATE_PUZZLE: "create-puzzle",
	ADD_SUBMISSION: "add-submission",
	CREATE_ACCOUNT: "create-account",
} as const;

export const activityTypes = z.enum(getValues(activityTypeEnum));

export type ActivityType = z.infer<typeof activityTypes>;
