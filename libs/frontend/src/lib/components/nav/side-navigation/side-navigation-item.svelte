<script lang="ts">
	import { page } from "$app/stores";
	import { cn } from "@/utils/cn";
	import type { Component, ComponentType } from "svelte";
	import type { FrontendUrl } from "types";

	interface Props {
		href: FrontendUrl;
		text: string;
		icon?: Component | null;
	}

	let { href, icon = null, text }: Props = $props();

	const SvelteComponent = $derived(icon);
</script>

<a
	{href}
	class={cn(
		"relative block w-full rounded-md px-4 py-2 hover:bg-stone-200 hover:underline hover:dark:bg-stone-800",
		$page.url.pathname === href &&
			"settings-link bg-stone-100 font-bold text-teal-600 hover:text-teal-800 dark:bg-stone-900 dark:text-teal-300 hover:dark:text-teal-100"
	)}
>
	<SvelteComponent class="mr-2 inline" size={16} aria-hidden="true" />

	<span>{text}</span>
</a>

<style lang="postcss">
	.settings-link::after {
		@apply absolute -left-2.5 top-0 h-full w-1.5 rounded-full bg-teal-500 hover:bg-teal-800 dark:bg-teal-300 dark:hover:bg-teal-100;
		content: "";
	}
</style>
