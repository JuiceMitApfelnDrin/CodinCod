<script lang="ts">
	import { cn } from "@/utils/cn";
	import { CheckCircle, CircleX, Circle } from "@lucide/svelte";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { PuzzleResultEnum, type PuzzleResult } from "types";

	interface Props {
		class?: HTMLInputAttributes["class"];
		puzzleResult: PuzzleResult | undefined;
	}

	let { class: className = undefined, puzzleResult }: Props = $props();
</script>

{#if puzzleResult === PuzzleResultEnum.SUCCESS}
	<span class="sr-only">successful test</span>
	<CheckCircle
		class={cn(
			"text-green-700 dark:border-green-300 dark:text-green-500",
			className
		)}
		aria-hidden="true"
	/>
{:else if puzzleResult === PuzzleResultEnum.ERROR || puzzleResult === PuzzleResultEnum.UNKNOWN}
	<span class="sr-only">failed test</span>
	<CircleX
		class={cn("text-red-700 dark:border-red-300 dark:text-red-500", className)}
		aria-hidden="true"
	/>
{:else}
	<span class="sr-only">didn't run test yet</span>
	<Circle
		class={cn(
			"text-stone-700 dark:border-stone-300 dark:text-stone-500",
			className
		)}
		aria-hidden="true"
	/>
{/if}
