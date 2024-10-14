<script lang="ts">
	import { formattedDateYearMonthDay } from "@/utils/date-functions";
	import type { Activity } from "types";

	export let activity: Activity | undefined;
</script>

{#if activity}
	<dl>
		<dt>Activity date</dt>
		<dd>
			{formattedDateYearMonthDay(activity.createdAt)}
		</dd>
		<dt>Activity type</dt>
		<dd>
			{activity.type}
		</dd>
	</dl>
{/if}
