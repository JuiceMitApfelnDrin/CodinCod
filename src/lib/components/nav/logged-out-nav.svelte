<script lang="ts">
	import { frontendUrls } from "types";
	import Settings from "lucide-svelte/icons/settings";
	import * as Menubar from "$lib/components/ui/menubar";
	import ToggleTheme from "./toggle-theme.svelte";

	const navigationLinks = [
		{
			href: frontendUrls.PLAY,
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
	<nav class="bg-secondary-500 dark:bg-secondary-900 py-6">
		<div class="container mx-auto flex flex-row flex-wrap items-end gap-8">
			<a href={frontendUrls.ROOT}>
				<span class="self-center whitespace-nowrap text-4xl font-semibold">CodinCod</span>
			</a>

			<ul class="flex flex-1 flex-row gap-4">
				{#each navigationLinks as link}
					<li
						class="rounded-md transition-all motion-reduce:transition-none dark:hover:bg-gray-500"
					>
						<a class="px-1 py-4" href={link.href}>{link.text}</a>
					</li>
				{/each}

				<li class="ml-auto">
					<a href={frontendUrls.LOGIN}>Login</a>
				</li>
			</ul>

			<Menubar.Root>
				<Menubar.Menu closeOnItemClick={false}>
					<Menubar.Trigger><Settings class="h-4 w-4" /></Menubar.Trigger>
					<Menubar.Content>
						<Menubar.Item><ToggleTheme /></Menubar.Item>
					</Menubar.Content>
				</Menubar.Menu>
			</Menubar.Root>
		</div>
	</nav>
</header>
