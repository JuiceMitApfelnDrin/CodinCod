<script lang="ts">
	import { cn } from "@/utils/cn";
	import type { HTMLInputAttributes } from "svelte/elements";
	import { type ValidatorEntity } from "types";
	import ValidatorStatus from "./validator-status.svelte";

	let className: HTMLInputAttributes["class"] = undefined;
	export { className as class };

	export let validators: ValidatorEntity[]; // validators with their status
	export let openTestsAccordion;
</script>

{#if validators}
	<ul
		class={cn(
			"hidden gap-4 rounded-full border-2 border-gray-300 px-8 py-4 dark:border-gray-300 lg:flex lg:flex-wrap",
			className
		)}
	>
		{#each validators as validator, index}
			<li>
				<a on:click={() => openTestsAccordion()} href={`#validator-${index}`}>
					<ValidatorStatus {validator} />
				</a>
			</li>
		{/each}
	</ul>
{/if}
