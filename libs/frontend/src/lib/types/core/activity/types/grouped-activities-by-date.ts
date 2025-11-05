import type { Activity } from "../schema/activity.schema.js";

export type GroupedActivitiesByDate = {
	[dateKey: string]: Activity[];
};
