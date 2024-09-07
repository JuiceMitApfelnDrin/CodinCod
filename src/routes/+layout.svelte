<script lang="ts">
	import { browser } from "$app/environment";
	import Nav from "@/components/nav/nav.svelte";
	import { localStorageKeys, themeOptions } from "@/config/local-storage";

	// in case ever needed
	// function handleSwitchDarkMode() {
	// 	darkMode = !darkMode;

	// 	localStorage.setItem("theme", darkMode ? "dark" : "light");

	// 	darkMode
	// 		? document.documentElement.classList.add("dark")
	// 		: document.documentElement.classList.remove("dark");
	// }

	export let data;

	if (browser) {
		if (
			localStorage.theme === themeOptions.DARK ||
			(!(localStorageKeys.THEME in localStorage) &&
				window.matchMedia("(prefers-color-scheme: dark)").matches)
		) {
			document.documentElement.classList.add(themeOptions.DARK);
			localStorage.setItem(localStorageKeys.THEME, themeOptions.DARK);
		} else {
			document.documentElement.classList.remove(themeOptions.DARK);
			localStorage.setItem(localStorageKeys.THEME, themeOptions.LIGHT);
		}
	}
</script>

<Nav {data} />

<div class="dark:bg-primary-900 dark:text-primary-100 flex min-h-screen flex-col">
	<slot />
</div>
