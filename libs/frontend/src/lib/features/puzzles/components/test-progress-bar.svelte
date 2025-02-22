<script lang="ts">
	import { cn } from "@/utils/cn";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { type PuzzleResult } from "types";
	import ValidatorStatus from "./validator-status.svelte";

	let className: HTMLInputAttributes["class"] = undefined;
	export { className as class };

	export let puzzleResults: PuzzleResult[];
	export let openTestsAccordion;
</script>

{#if puzzleResults}
	<ul
		class={cn(
			"hidden gap-4 rounded-full border-2 border-gray-300 px-8 py-4 dark:border-gray-300 lg:flex lg:flex-wrap",
			className
		)}
	>
		{#each puzzleResults as puzzleResult, index}
			<li>
				<a on:click={() => openTestsAccordion()} href={`#validator-${index}`}>
					<ValidatorStatus {puzzleResult} />
				</a>
			</li>
		{/each}
	</ul>
{/if}
