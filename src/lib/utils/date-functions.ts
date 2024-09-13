import dayjs, { type ConfigType } from "dayjs";

/**
 * receive something that should resemble a date
 *
 * @param {ConfigType} date
 * @returns a formatted string, "2024, Sept. 10, 20:38"
 */
export function formattedDateYearMonthDay(date: ConfigType) {
	return dayjs(date).format("YYYY, MMM D");
}
