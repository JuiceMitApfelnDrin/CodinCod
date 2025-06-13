<script lang="ts">
	import { run } from 'svelte/legacy';

	import dayjs from "dayjs";
	import { calculatePercentage } from "@/utils/calculate-percentage";
	import { frontendUrls, type GroupedActivitiesByDate } from "types";
	import { cn } from "@/utils/cn";

	interface Props {
		activitiesGroupedByDate: GroupedActivitiesByDate;
	}

	let { activitiesGroupedByDate }: Props = $props();
	let minAmount = $state(0);
	let maxAmount = $state(0);

	const totalDays = 7;
	const totalWeeks = 54;
	const minNumberOfDays = totalWeeks * totalDays;

	const now = dayjs();
	const startDate = now.subtract(minNumberOfDays, "day");
	const endDate = now;

	let days = $derived(Array.from({ length: minNumberOfDays }, (_, i) => {
		const date = startDate.add(i, "day").format("YYYY-MM-DD");
		return activitiesGroupedByDate[date] ? activitiesGroupedByDate[date].length : 0;
	}));

	let monthGroups: Array<{ month: string; colspan: number }> = $state([]);

	run(() => {
		const nonZeroDays = days.filter((count) => count > 0);
		minAmount = nonZeroDays.length > 0 ? Math.min(...nonZeroDays) : 0;
		maxAmount = Math.max(...days);

		// Calculate month groups
		const groups = [];
		let currentYearMonth: string | null = null;
		let currentGroup: { month: string; colspan: number; yearMonth: string } | null = null;

		for (let weekIndex = 0; weekIndex < totalWeeks; weekIndex++) {
			const weekStartDate = startDate.add(weekIndex * totalDays, "day");
			const yearMonth = weekStartDate.format("YYYY-MM");

			if (yearMonth !== currentYearMonth) {
				if (currentGroup) groups.push(currentGroup);
				currentGroup = {
					month: weekStartDate.format("MMM"),
					colspan: 1,
					yearMonth: yearMonth
				};
				currentYearMonth = yearMonth;
			} else if (currentGroup) {
				currentGroup.colspan += 1;
			}
		}

		monthGroups = currentGroup ? [...groups, currentGroup] : groups;
	});

	let dayNames = $derived(Array.from({ length: totalDays }, (_, i) => {
		const d = dayjs().startOf("week").add(i, "day");
		return { long: d.format("dddd"), short: d.format("ddd").toUpperCase() };
	}));

	function calcDayStyle(count: number): string {
		if (count <= 0) {
			return "bg-stone-100 dark:bg-stone-800";
		}

		const opacity = (calculatePercentage(minAmount, maxAmount, count) + 0.15) * 100;

		if (opacity <= 20) {
			return "bg-teal-200 dark:bg-teal-700";
		} else if (opacity <= 40) {
			return "bg-teal-300 dark:bg-teal-600";
		} else if (opacity <= 60) {
			return "bg-teal-400 dark:bg-teal-500";
		} else if (opacity <= 80) {
			return "bg-teal-500 dark:bg-teal-400";
		} else if (opacity <= 90) {
			return "bg-teal-600 dark:bg-teal-300";
		} else {
			return "bg-teal-700 dark:bg-teal-200";
		}
	}

	function getDateFromWeekWithOffset(weekIndex: number, dayOffset: number) {
		return startDate.add(weekIndex * totalDays + dayOffset, "day");
	}

	function getCellTitle(weekIndex: number, dayOffset: number, count: number): string {
		const cellDate = getDateFromWeekWithOffset(weekIndex, dayOffset).format("MMMM DD, YYYY");

		return `Solved ${count} puzzles on ${cellDate}`;
	}
</script>

<div class="overflow-x-scroll rounded-lg border border-stone-300 p-6 shadow-sm">
	<table class="mb-2 w-full border-separate border-spacing-1">
		<caption class="sr-only">Activity Calendar</caption>
		<thead>
			<tr>
				<th colspan={1} class="w-0"></th>
				{#each monthGroups as group}
					<th colspan={group.colspan} class="p-0 text-center font-bold">
						<span class="sr-only">{group.month}</span>
						<span aria-hidden="true">{group.month}</span>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each Array(totalDays) as _, rowIndex}
				<tr class="h-3">
					<td class="w-0 pr-1 text-right text-xs font-bold">
						<span class="sr-only">{dayNames[rowIndex].long}</span>
						<span aria-hidden="true">{dayNames[rowIndex].short}</span>
					</td>
					{#each Array(totalWeeks) as _, weekIndex}
						{@const cellIndex = weekIndex * totalDays + rowIndex}
						<td
							class={cn(calcDayStyle(days[cellIndex]), "activity-cell", "square-cell")}
							title={getCellTitle(weekIndex, rowIndex, days[cellIndex])}
						></td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>

	<div
		class="legend mt-4 flex flex-col-reverse items-center justify-between gap-4 py-2 text-sm lg:flex-row"
	>
		<a
			href={frontendUrls.DOCS_ACTIVITY}
			class="text-sm text-teal-600 no-underline hover:underline dark:text-teal-400"
		>
			Learn how we measure activity
		</a>

		<div class="flex items-center gap-2">
			<span class="text-xs">Less</span>
			<div class="flex h-4 overflow-hidden rounded-sm">
				<div
					class={cn(
						"activity-cell",
						"rounded-full",
						"bg-gradient-to-r from-stone-100 via-teal-200 via-25% to-teal-700 dark:from-stone-800 dark:via-teal-700 dark:to-teal-200"
					)}
				></div>
			</div>
			<span class="text-xs">More</span>
		</div>
	</div>
</div>

<style lang="postcss">
	.activity-cell {
		@apply h-4 min-h-4 w-4 min-w-4 hover:scale-110 hover:shadow-md motion-safe:transition-transform;
	}
	.legend .activity-cell {
		@apply w-32;
	}
	.square-cell {
		@apply aspect-square max-h-4 max-w-4 rounded-sm;
	}
	td {
		line-height: 0;
	}
</style>
