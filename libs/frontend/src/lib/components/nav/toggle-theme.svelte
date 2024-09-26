<script lang="ts">
	import Toggle from "../ui/toggle/toggle.svelte";
	import Moon from "lucide-svelte/icons/moon";
	import Sun from "lucide-svelte/icons/sun";
	import { isDarkTheme, toggleDarkTheme } from "../../stores";
</script>

<Toggle
	aria-label={`Change to ${$isDarkTheme ? "light mode" : "dark mode"}`}
	pressed={$isDarkTheme}
	on:click={toggleDarkTheme}
>
	Current theme: {#if $isDarkTheme}
		<Moon aria-label="dark mode" />
	{:else}
		<Sun aria-label="light mode" />
	{/if}
</Toggle>
