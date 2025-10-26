<script lang="ts">
	import { page } from "$app/state";
	import { cn } from "@/utils/cn";
	import type { Component } from "svelte";
	import type { FrontendUrl } from "types";

	let {
		href,
		icon = undefined,
		text
	}: {
		href: FrontendUrl;
		text: string;
		icon?: Component;
	} = $props();
</script>

<a
	{href}
	class={cn(
		"relative block w-full rounded-md px-4 py-2 hover:bg-stone-200 hover:underline dark:hover:bg-stone-800",
		page.url.pathname === href &&
			"settings-link bg-stone-100 font-bold text-teal-600 hover:text-teal-800 dark:bg-stone-900 dark:text-teal-300 dark:hover:text-teal-100"
	)}
>
	{#if icon}
		{@const Icon = icon}

		<Icon class="mr-2 inline" size={16} aria-hidden="true" />
	{/if}

	<span>{text}</span>
</a>

<style lang="postcss">
	@reference "tailwindcss";

	.settings-link::after {
		@apply absolute top-0 -left-2.5 h-full w-1.5 rounded-full bg-teal-500 hover:bg-teal-800 dark:bg-teal-300 dark:hover:bg-teal-100;
		content: "";
	}
</style>
