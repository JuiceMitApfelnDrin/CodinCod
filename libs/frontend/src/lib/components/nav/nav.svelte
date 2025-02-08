<script lang="ts">
	import { isAuthenticated } from "../../stores";
	import { frontendUrls, type FrontendLink } from "types";
	import { websiteName } from "@/config/general";
	import ToggleTheme from "./toggle-theme.svelte";
	import UserDropdown from "./user-dropdown.svelte";

	const navigationLinks: FrontendLink[] = [
		{
			href: frontendUrls.MULTIPLAYER,
			text: "Play"
		},
		{
			href: frontendUrls.PUZZLES,
			text: "Puzzles"
		},
		{
			href: frontendUrls.LEARN,
			text: "Learn"
		}
	];
</script>

<header>
	<nav
		class="bg-teal-300 bg-gradient-to-b from-teal-100 py-6 text-teal-950 dark:bg-teal-800 dark:from-teal-950 dark:text-teal-100"
	>
		<div class="container mx-auto flex flex-row flex-wrap items-end gap-8">
			<a href={frontendUrls.ROOT}>
				<span class="self-center whitespace-nowrap text-4xl font-bold">{websiteName}</span>
			</a>

			<ul class="flex flex-1 flex-row gap-4">
				{#each navigationLinks as link}
					<li
						class="rounded-md transition-all motion-reduce:transition-none dark:hover:bg-gray-500"
					>
						<a class="px-1 py-4" href={link.href}>{link.text}</a>
					</li>
				{/each}
				{#if !$isAuthenticated}
					<li class="ml-auto">
						<a class="px-1 py-4" href={frontendUrls.LOGIN}>Login</a>
					</li>
				{/if}
			</ul>
			{#if $isAuthenticated}
				<UserDropdown></UserDropdown>
			{/if}
			<ToggleTheme />
		</div>
	</nav>
</header>
