<script lang="ts">
	import { calculatePercentage } from "@/utils/calculate-percentage";
	import { cn } from "@/utils/cn";
	import dayjs from "dayjs";
	import type { Activity } from "types";

	export let activity: Activity[] = [];
	export let minAmount = 0;
	export let maxAmount = 8;

	interface GroupedItems {
		[dateKey: string]: Activity[]; // The key is a string (date), and the value is an array of Items
	}

	function groupByCreatedAtDate(items: Activity[]) {
		return items.reduce<GroupedItems>((acc, item) => {
			// Ensure createdAt is a valid date
			const dateKey = dayjs(item.createdAt).format("YYYY-MM-DD");

			// Initialize the array for this date if it doesn't exist
			if (!acc[dateKey]) {
				acc[dateKey] = [];
			}

			// Push the item into the corresponding array
			acc[dateKey].push(item);

			return acc;
		}, {});
	}

	console.log(groupByCreatedAtDate(activity));
	const groupedActivity = groupByCreatedAtDate(activity);

	// create the thing first, then use it
	// let days: number[] = [];

	// const currentDate = new Date();

	// // go from back to front, since submissions are added always at the back
	// let currentIndexItemInActivity = activity.length - 1;

	// // go over the previous 365 days
	// for (let i = 0; i < 364; i++) {
	// 	let solutionsThisDay = 0;
	// 	// Calculate the date for the current iteration
	// 	const pastDate = new Date();
	// 	pastDate.setDate(currentDate.getDate() - i);

	// 	while (
	// 		currentIndexItemInActivity >= 0 &&
	// 		pastDate < new Date(activity[currentIndexItemInActivity]?.createdAt)
	// 	) {
	// 		currentIndexItemInActivity -= 1;
	// 		solutionsThisDay += 1;
	// 	}

	// 	days.push(solutionsThisDay);
	// }

	// Create an array for the previous 365 days and count activities for each day
	let days: number[] = Array.from({ length: 364 })
		.map((_, i) => {
			const date = dayjs().subtract(i, "day").format("YYYY-MM-DD");
			return groupedActivity[date] ? groupedActivity[date].length : 0;
		})
		.reverse(); // reverse to start with the oldest day

	// const minActivity: number = Math.min(...days);
	// const maxActivity: number = Math.max(...days);

	// const dayIndexToFormattedDate = (index: number): string => {
	// 	const date = new Date();
	// 	return new Date(date.setDate(date.getDate() - index)).toLocaleString(undefined, {
	// 		day: "numeric",
	// 		month: "long",
	// 		year: "numeric"
	// 	});
	// };

	const calcDayStyle = (activity: number): string => {
		if (activity > 0)
			return `background: rgba(217, 70, 239, ${
				calculatePercentage(minAmount, maxAmount, activity) + 0.15
			});`;

		return `background: rgba(64, 64, 64, 1)`;
	};

	const dayNames = Array.from({ length: 7 }).map((_, index) => {
		const currentDay = dayjs().subtract(index, "day");

		return {
			shortDayName: currentDay.format("ddd").toUpperCase(),
			longDayName: currentDay.format("dddd")
		};
	});

	const months = Array.from({ length: 12 })
		.map((_, index) => {
			const currentMonth = dayjs().subtract(index, "month");

			return {
				longMonthName: currentMonth.format("MMMM"),
				shortMonthName: currentMonth.format("MMM")
			};
		})
		.reverse(); // reverse to start with the oldest month
</script>

<div
	class="dark:border-primary-500 border-primary-700 h-full w-full flex-col rounded-lg border bg-white dark:bg-black"
>
	<!-- TODO: possibly make this a table instead, with a tooltips and sr-only text -->
	<table class="overflow-x-scroll">
		<caption class="sr-only hidden">Activity graph</caption>
		<thead>
			<tr>
				<th></th>
				{#each months as monthName}
					<th
						colspan="4"
						class="month-header dark:text-primary-300 text-primary-600 text-center font-bold"
					>
						<span class="sr-only">
							{monthName.longMonthName}
						</span>
						<span aria-hidden="true">
							{monthName.shortMonthName}
						</span>
					</th>
				{/each}
			</tr>
		</thead>

		<tbody>
			{#each dayNames as dayName, index}
				<tr class="calendar">
					<td
						class="day-header dark:text-primary-300 text-primary-600 flex w-full items-center justify-center text-left font-bold"
					>
						<span class="sr-only">
							{dayName.longDayName}
						</span>
						<span aria-hidden="true" class={cn(index % 2 !== 0 && "hidden")}>
							{dayName.shortDayName}
						</span>
					</td>

					{#each days as activity, dayIndex}
						{#if dayIndex % 7 === index}
							<td
								class="day rounded shadow-sm shadow-neutral-700"
								style={calcDayStyle(activity)}
								title="Solved {activity} puzzles on {dayjs()
									.subtract(dayIndex, 'day')
									.format('MMMM DD, YYYY')}"
							/>
						{/if}
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>

	<div>
		<a href="docs/activity">Learn how we measure activity</a>
	</div>
</div>

<style>
	table {
		border-spacing: 0.25rem;
		border-collapse: separate;
	}

	:root {
		--square-size: 0.75rem;
	}

	.calendar {
	}

	.day-header {
		font-size: calc(var(--square-size) - 0.05rem);
	}

	tr {
		height: var(--square-size);
	}
	td {
		line-height: 0;
		width: var(--square-size);
	}
</style>
