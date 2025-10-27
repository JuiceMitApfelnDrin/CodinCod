<script lang="ts">
	import { cn } from "@/utils/cn";
	import type { Snippet } from "svelte";

	let {
		children,
		icon = undefined,
		text
	}: {
		icon?: Snippet;
		text: string;
		children?: Snippet;
	} = $props();
</script>

<details class="group" open>
	<summary
		class={cn(
			"relative block w-full rounded-md px-4 py-2 hover:bg-stone-200 hover:underline dark:hover:bg-stone-800"
		)}
	>
		{#if icon}
			{@const Icon = icon}

			<Icon class="mr-2 inline" size={16} aria-hidden="true" />
		{/if}

		<span>{text}</span>
	</summary>
	<ul class="mt-2 ml-4 flex flex-col gap-1">
		{@render children?.()}
	</ul>
</details>

<style>
	details > summary::-webkit-details-marker {
		display: none;
	}
	details > summary::before {
		content: "▶";
		display: inline-block;
		margin-right: 0.5rem;
	}

	@media screen and (prefers-reduced-motion: no-preference) {
		details > summary::before {
			transition: transform 0.2s;
		}
	}

	details[open] > summary::before {
		transform: rotate(90deg);
	}
</style>
