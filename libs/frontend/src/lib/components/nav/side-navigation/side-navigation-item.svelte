<script lang="ts">
	import { page } from "$app/state";
	import { cn } from "@/utils/cn";
	import type { Component } from "svelte";
	import type { FrontendUrl } from "types";

	interface Props {
		href: FrontendUrl;
		text: string;
		icon?: Component;
	}

	let { href, icon = undefined, text }: Props = $props();
</script>

<a
	{href}
	class={cn(
		"relative block w-full rounded-md px-4 py-2 hover:bg-stone-200 hover:underline hover:dark:bg-stone-800",
		page.url.pathname === href &&
			"settings-link bg-stone-100 font-bold text-teal-600 hover:text-teal-800 dark:bg-stone-900 dark:text-teal-300 hover:dark:text-teal-100"
	)}
>
	{#if icon}
		{@const Icon = icon}

		<Icon class="mr-2 inline" size={16} aria-hidden="true" />
	{/if}

	<span>{text}</span>
</a>

<style lang="postcss">
	.settings-link::after {
		@apply absolute -left-2.5 top-0 h-full w-1.5 rounded-full bg-teal-500 hover:bg-teal-800 dark:bg-teal-300 dark:hover:bg-teal-100;
		content: "";
	}
</style>
