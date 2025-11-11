<script lang="ts">
	import { cn } from "@/utils/cn";
	import type { HTMLInputAttributes } from "svelte/elements";
	import type { PuzzleResult } from "$lib/types/core/piston/schema/puzzle-result.js";
	import ValidatorStatus from "./validator-status.svelte";

	let {
		class: className = undefined,
		openTestsAccordion,
		puzzleResults
	}: {
		class?: HTMLInputAttributes["class"];
		puzzleResults: (PuzzleResult | undefined)[];
		openTestsAccordion: () => void;
	} = $props();
</script>

{#if puzzleResults}
	<ul
		class={cn(
			"hidden gap-4 rounded-full border-2 border-stone-300 px-8 py-4 lg:flex lg:flex-wrap dark:border-stone-300",
			className
		)}
	>
		{#each puzzleResults as puzzleResult, index}
			<li>
				<a onclick={() => openTestsAccordion()} href={`#validator-${index}`}>
					<ValidatorStatus {puzzleResult} />
				</a>
			</li>
		{/each}
	</ul>
{/if}
