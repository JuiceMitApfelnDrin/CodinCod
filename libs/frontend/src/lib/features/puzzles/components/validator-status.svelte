<script lang="ts">
	import { cn } from "@/utils/cn";
	import { CheckCircle, CircleX, Circle } from "lucide-svelte";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { PuzzleResultEnum, type PuzzleResult } from "types";

	let className: HTMLInputAttributes["class"] = undefined;
	export { className as class };

	export let puzzleResult: PuzzleResult;
</script>

{#if puzzleResult === PuzzleResultEnum.SUCCESS}
	<span class="sr-only">successful test</span>
	<CheckCircle
		class={cn("text-green-700 dark:border-green-300 dark:text-green-500", className)}
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
		class={cn("text-gray-700 dark:border-gray-300 dark:text-gray-500", className)}
		aria-hidden="true"
	/>
{/if}
