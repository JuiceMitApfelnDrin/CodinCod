<script lang="ts">
	import { calculatePercentage } from "@/utils/calculate-percentage";
	import { cn } from "@/utils/cn";
	import dayjs from "dayjs";
	import type { GroupedActivitiesByDate } from "types";

	export let activitiesGroupedByDate: GroupedActivitiesByDate;
	export let minAmount = 0;
	export let maxAmount = 8;

	// Create an array for the previous 365 days and count activities for each day
	let days: number[] = Array.from({ length: 364 })
		.map((_, i) => {
			const date = dayjs().subtract(i, "day").format("YYYY-MM-DD");
			return activitiesGroupedByDate[date] ? activitiesGroupedByDate[date].length : 0;
		})
		.reverse(); // reverse to start with the oldest day

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
	class="dark:border-primary-500 border-primary-700 h-full w-full flex-col rounded-lg border p-4"
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
