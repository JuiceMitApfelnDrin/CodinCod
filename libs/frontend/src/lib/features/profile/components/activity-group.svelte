<script lang="ts">
	import { formattedDateYearMonthDay } from "@/utils/date-functions";
	import { ChevronDown } from "lucide-svelte";
	import {
		activityTypeEnum,
		websiteName,
		type AcceptedDate,
		type Activity,
		type ActivityType
	} from "types";

	export let date: AcceptedDate;
	export let activities: Activity[] = [];

	let activitiesByType = new Map<ActivityType, Activity[]>();

	$: {
		activities.forEach((activity) => {
			const activities = activitiesByType.get(activity.type) || [];
			activitiesByType.set(activity.type, [...activities, activity]);
		});
		console.log({ activitiesByType });
	}

	const typeToHumanText = {
		[activityTypeEnum.ADD_SUBMISSION]: "solved a puzzle",
		[activityTypeEnum.CREATE_ACCOUNT]: `joined us on ${websiteName}`,
		[activityTypeEnum.CREATE_PUZZLE]: "created a puzzle"
	};
</script>

<details open class="w-full max-w-md rounded-lg border border-stone-300 shadow-sm">
	<summary class="cursor-pointer list-none px-4 py-3">
		<div class="flex items-center justify-between">
			<span class="text-sm font-medium">
				<span class="font-semibold text-teal-700 dark:text-teal-300">{activities.length}</span>
				{activities.length === 1 ? "activity" : "activities"} on
				<time class="">{formattedDateYearMonthDay(date)}</time>
			</span>
			<ChevronDown />
		</div>
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

<style lang="postcss">
	details[open] summary svg {
		transform: rotate(180deg);
	}
</style>
