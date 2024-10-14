<script lang="ts">
	import { formattedDateYearMonthDay } from "@/utils/date-functions";
	import type { AcceptedDate, Activity } from "types";
	import DisplayActivity from "./display-activity.svelte";

	export let date: AcceptedDate;
	export let activities: Activity[] = [];
</script>

{#if activities}
	<details open>
		<summary>{activities.length} activities happened on {formattedDateYearMonthDay(date)}</summary>

		<ul>
			{#each activities as activity}
				<li>
					<DisplayActivity {activity} />
				</li>
			{/each}
		</ul>
	</details>
{/if}
