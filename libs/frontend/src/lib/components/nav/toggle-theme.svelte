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
		"dark:hover:text-foreground dark:hover:bg-background bg-background bg-inherit dark:bg-inherit",
		className
	)}
>
	{#if $isDarkTheme}
		<Moon aria-label="dark mode" />
	{:else}
		<Sun aria-label="light mode" />
	{/if}
</Toggle>
