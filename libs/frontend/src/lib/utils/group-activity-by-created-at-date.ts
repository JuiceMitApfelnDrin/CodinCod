import dayjs from "dayjs";
import type { Activity, GroupedActivitiesByDate } from "types";

export function groupByCreatedAtDate(items: Activity[]) {
	return items.reduce<GroupedActivitiesByDate>((acc, item) => {
		const dateKey = dayjs(item.createdAt).format("YYYY-MM-DD");

		// Initialize the array for this date if it doesn't exist
		if (!acc[dateKey]) {
			acc[dateKey] = [];
		}

		acc[dateKey].push(item);

		return acc;
	}, {});
}
