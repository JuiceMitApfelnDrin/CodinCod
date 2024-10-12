<script lang="ts">
	import { formattedDateYearMonthDay } from "@/utils/date-functions";
	import type { Activity } from "types";

	export let activity: Activity | undefined;
</script>

{#if activity}
	Activity date: {formattedDateYearMonthDay(activity.createdAt)}
	Activity type: {activity.type}
{/if}
