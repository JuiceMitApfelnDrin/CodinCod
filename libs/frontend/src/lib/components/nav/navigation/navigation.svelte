<script lang="ts">
	import { isAuthenticated } from "../../../stores";
	import { frontendUrls } from "types";
	import ToggleTheme from "../toggle-theme.svelte";
	import UserDropdown from "../user-dropdown.svelte";
	import NavigationItem from "./navigation-item.svelte";
</script>

<header
	class="bg-teal-300 bg-gradient-to-b from-teal-100 text-teal-950 dark:bg-teal-800 dark:from-teal-950 dark:text-teal-100"
>
	<nav class="container flex flex-row items-center gap-8 py-6">
		<a href={frontendUrls.ROOT}>
			<span class="self-center whitespace-nowrap font-mono text-4xl font-bold">CodinCod</span>
		</a>

		<ul class="mt-3 flex flex-1 flex-row gap-4">
			<NavigationItem href={frontendUrls.MULTIPLAYER} text="Play" />
			<NavigationItem href={frontendUrls.PUZZLES} text="Puzzles" />
			<NavigationItem href={frontendUrls.LEARN} text="Learn" />

			{#if !$isAuthenticated}
				<NavigationItem class="ml-auto" text="Login" href={frontendUrls.LOGIN}></NavigationItem>
			{/if}
		</ul>

		{#if $isAuthenticated}
			<UserDropdown></UserDropdown>
		{/if}

		<ToggleTheme class="mt-2" />
	</nav>
</header>
