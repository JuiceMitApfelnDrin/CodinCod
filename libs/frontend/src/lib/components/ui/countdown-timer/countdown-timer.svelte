<script lang="ts">
	import LogicalUnit from "../logical-unit/logical-unit.svelte";
	import { cn } from "@/utils/cn";
	import { currentTime } from "@/stores/current-time";
	import dayjs from "dayjs";

	export let endDate: Date | undefined;

	const DEFAULT_TIME_REMAINING = { days: 0, hours: 0, minutes: 0, seconds: 0 };

	let timeRemaining = DEFAULT_TIME_REMAINING;

	$: {
		if (!endDate) {
			timeRemaining = DEFAULT_TIME_REMAINING;
		} else {
			const now = $currentTime.getTime();
			const end = dayjs(endDate);
			const diff = Math.max(end.diff(now), 0); // Ensure no negative values

			const seconds = Math.floor((diff / 1000) % 60);
			const minutes = Math.floor((diff / (1000 * 60)) % 60);
			const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
			const days = Math.floor(diff / (1000 * 60 * 60 * 24));

			timeRemaining = { days, hours, minutes, seconds };
		}
	}

	let showDays = false,
		showHours = false,
		showMinutes = false,
		showSeconds = false;
	$: {
		showDays = timeRemaining.days > 0;
		showHours = showDays || timeRemaining.hours > 0;
		showMinutes = showHours || timeRemaining.minutes > 0;
		showSeconds = true;
	}

	function formatToTwoDigits(value: number | string) {
		return value.toString().padStart(2, "0");
	}
</script>

{#if endDate}
	<LogicalUnit
		class={cn(
			"flex flex-col items-center justify-center gap-4 rounded-lg border px-8 py-2 shadow-lg motion-safe:transition-all lg:flex-row",
			!showMinutes &&
				"border-red-600 shadow-red-700 motion-safe:animate-pulse dark:border-red-500 dark:shadow-red-400",
			!showHours &&
				timeRemaining.minutes == 1 &&
				"border-yellow-600 shadow-yellow-200 dark:border-yellow-500 dark:shadow-yellow-700",
			!showMinutes && timeRemaining.seconds === 0 && "motion-safe:animate-none"
		)}
	>
		<p class="text-xs">Time left</p>
		<dl
			class={cn(
				"countdown flex flex-row text-2xl font-bold",
				!showMinutes && "text-red-600 dark:text-red-400",
				!showHours && timeRemaining.minutes == 1 && "text-yellow-600 dark:text-yellow-400"
			)}
		>
			{#if showDays}
				<dt class="sr-only">Days</dt>
				<dd aria-live="polite">{formatToTwoDigits(timeRemaining.days)}</dd>
			{/if}
			{#if showHours}
				<dt class="sr-only">Hours</dt>
				<dd aria-live="polite">{formatToTwoDigits(timeRemaining.hours)}</dd>
			{/if}
			{#if showMinutes}
				<dt class="sr-only">Minutes</dt>
				<dd aria-live="polite">{formatToTwoDigits(timeRemaining.minutes)}</dd>
			{/if}
			{#if showSeconds}
				<dt class="sr-only">Seconds</dt>
				<dd aria-live="polite">{formatToTwoDigits(timeRemaining.seconds)}</dd>
			{/if}
		</dl>
	</LogicalUnit>
{/if}

<style>
	.countdown dd:not(:nth-of-type(1))::before {
		content: ":";
	}
</style>
