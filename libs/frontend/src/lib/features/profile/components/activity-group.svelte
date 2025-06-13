<script lang="ts">
	import { run } from 'svelte/legacy';

	import { formattedDateYearMonthDay } from "@/utils/date-functions";
	import { ChevronDown } from "lucide-svelte";
	import { activityTypeEnum, type AcceptedDate, type Activity, type ActivityType } from "types";

	interface Props {
		date: AcceptedDate;
		activities?: Activity[];
	}

	let { date, activities = [] }: Props = $props();

	let activitiesByType = new Map<ActivityType, Activity[]>();

	run(() => {
		activities.forEach((activity) => {
			const activities = activitiesByType.get(activity.type) || [];
			activitiesByType.set(activity.type, [...activities, activity]);
		});
	});

	const typeToHumanText = {
		[activityTypeEnum.ADD_SUBMISSION]: "solved a puzzle",
		[activityTypeEnum.CREATE_ACCOUNT]: `joined us on CodinCod`,
		[activityTypeEnum.CREATE_PUZZLE]: "created a puzzle"
	};
</script>

<details open class="w-full max-w-md rounded-lg border border-stone-300 shadow-sm">
	<summary class="flex cursor-pointer list-none items-center justify-between px-4 py-3">
		<span class="text-sm font-medium">
			<span class="font-semibold text-teal-700 dark:text-teal-300">{activities.length}</span>
			{activities.length === 1 ? "activity" : "activities"} on
			<time class="">{formattedDateYearMonthDay(date)}</time>
		</span>

		<ChevronDown aria-hidden="true" />
	</summary>

	<div class="border-t p-4">
		<ul class="space-y-2">
			{#each activitiesByType.entries() as [type, activities]}
				<li class="flex items-center justify-between rounded-md px-3 py-2 text-sm">
					<span class="font-medium">
						{typeToHumanText[type]}
					</span>
					<span class="rounded-full px-2.5 py-0.5 text-sm font-medium">
						{activities.length}
						{activities.length === 1 ? "time" : "times"}
					</span>
				</li>
			{/each}
		</ul>
	</div>
</details>
