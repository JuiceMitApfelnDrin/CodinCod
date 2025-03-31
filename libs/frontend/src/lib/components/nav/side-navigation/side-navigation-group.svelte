<script lang="ts">
	import { cn } from "@/utils/cn";
	import type { ComponentType } from "svelte";

	export let icon: ComponentType | null = null;
	export let text: string;
</script>

<details class="group" open>
	<summary
		class={cn(
			"relative block w-full rounded-md px-4 py-2 hover:bg-stone-200 hover:underline hover:dark:bg-stone-800"
		)}
	>
		<svelte:component this={icon} class="mr-2 inline" size={16} aria-hidden="true" />

		<span>{text}</span>
	</summary>
	<ul class="ml-4 mt-2 flex flex-col gap-1">
		<slot />
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
