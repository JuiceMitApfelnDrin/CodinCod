<script lang="ts">
	import { isDarkTheme, toggleDarkTheme } from "@/stores";
	import Moon from "lucide-svelte/icons/moon";
	import Sun from "lucide-svelte/icons/sun";
	import Toggle from "../ui/toggle/toggle.svelte";
	import { cn } from "@/utils/cn";

	type $$Props = { class?: string };
	let className: $$Props["class"] = undefined;

	export { className as class };
</script>

<Toggle
	aria-label={`Change to ${$isDarkTheme ? "light mode" : "dark mode"}`}
	pressed={$isDarkTheme}
	on:click={toggleDarkTheme}
	class={cn(
		"bg-background bg-transparent dark:bg-inherit dark:hover:bg-background dark:hover:text-foreground",
		className
	)}
>
	{#if $isDarkTheme}
		<Moon aria-label="dark mode" />
	{:else}
		<Sun aria-label="light mode" />
	{/if}
</Toggle>
