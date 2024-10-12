<script lang="ts">
	import { formattedDateYearMonthDay } from "@/utils/date-functions";
	import type { AcceptedDate } from "types";
	import Activity from "./activity.svelte";

	export let date: AcceptedDate;
	export let activities: Activity[] = [];
</script>

{#if activities}
	<details open>
		<summary>{activities.length} activities happened on {formattedDateYearMonthDay(date)}</summary>

		<ul>
			{#each activities as activity}
				<li>
					<Activity {activity} />
				</li>
			{/each}
		</ul>
	</details>
{/if}
