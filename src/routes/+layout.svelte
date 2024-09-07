<script lang="ts">
	import { browser } from "$app/environment";
	import Nav from "@/components/nav/nav.svelte";
	import { localStorageKeys, themeOptions } from "@/config/local-storage";
	import { theme } from "../stores.js";

	export let data;

	// if browser is present and the user hasn't made a choice yet
	if (browser && !(localStorageKeys.THEME in localStorage)) {
		const prefersDarkTheme = window.matchMedia("(prefers-color-scheme: dark)").matches;

		if (prefersDarkTheme) {
			theme.set(themeOptions.DARK);
		} else {
			theme.set(themeOptions.LIGHT);
		}
	}
</script>

<Nav {data} />

<div class="dark:bg-primary-900 dark:text-primary-100 flex min-h-screen flex-col">
	<slot />
</div>
