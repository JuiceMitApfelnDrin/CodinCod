<script lang="ts">
	import { formatToTwoDigits } from "@/utils/format-to-two-digits";
	import { onDestroy } from "svelte";
	import LogicalUnit from "../logical-unit/logical-unit.svelte";
	import { cn } from "@/utils/cn";

	export let endDate: Date | undefined;

	let timeRemaining = calculateTimeRemaining();
	let interval: ReturnType<typeof setInterval>;

	function calculateTimeRemaining() {
		if (!endDate) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

		const now = new Date().getTime();
		const end = new Date(endDate).getTime();
		const diff = Math.max(end - now, 0); // Ensure no negative values
		const seconds = Math.floor((diff / 1000) % 60);
		const minutes = Math.floor((diff / (1000 * 60)) % 60);
		const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		return { days, hours, minutes, seconds };
	}

	function updateTimer() {
		timeRemaining = calculateTimeRemaining();
		if (
			timeRemaining.days === 0 &&
			timeRemaining.hours === 0 &&
			timeRemaining.minutes === 0 &&
			timeRemaining.seconds === 0
		) {
			clearInterval(interval);
		}
	}

	interval = setInterval(updateTimer, 1000);

	onDestroy(() => {
		clearInterval(interval);
	});

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
