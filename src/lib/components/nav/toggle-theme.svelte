<script lang="ts">
	import { localStorageKeys, themeOptions } from "@/config/local-storage";
	import Toggle from "../ui/toggle/toggle.svelte";
	import Moon from "lucide-svelte/icons/moon";
	import Sun from "lucide-svelte/icons/sun";
	import { theme } from "../../../stores";

	let isDark = $theme === themeOptions.DARK;

	function switchTheme() {
		if (isDark) {
			theme.set(themeOptions.LIGHT);
		} else {
			theme.set(themeOptions.DARK);
		}
	}
</script>

<Toggle
	aria-label={`Change to ${isDark ? "light mode" : "dark mode"}`}
	bind:pressed={isDark}
	on:click={switchTheme}
>
	Current theme: {#if isDark}
		<Moon aria-label="dark mode" />
	{:else}
		<Sun aria-label="ligth mode" />
	{/if}
</Toggle>
