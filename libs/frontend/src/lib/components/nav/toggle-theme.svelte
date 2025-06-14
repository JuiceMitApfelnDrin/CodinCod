<script lang="ts">
	import { isDarkTheme, toggleDarkTheme } from "@/stores";
	import Moon from "@lucide/svelte/icons/moon";
	import Sun from "@lucide/svelte/icons/sun";
	import Toggle from "../ui/toggle/toggle.svelte";
	import { cn } from "@/utils/cn";
	import { Toggle as TogglePrimitive } from "bits-ui";
	import type { DataTestIdProp } from "@/config/test-ids";

	type $$Props = TogglePrimitive.RootProps & { class?: string };

	let {
		class: className = undefined
	}: {
		class?: $$Props["class"];
	} & DataTestIdProp = $props();
</script>

<Toggle
	aria-label={`Change to ${$isDarkTheme ? "light mode" : "dark mode"}`}
	pressed={$isDarkTheme}
	onclick={toggleDarkTheme}
	class={cn(
		"bg-background dark:hover:bg-background dark:hover:text-foreground bg-transparent dark:bg-inherit",
		className
	)}
>
	{#if $isDarkTheme}
		<Moon aria-label="dark mode" />
	{:else}
		<Sun aria-label="light mode" />
	{/if}
</Toggle>
