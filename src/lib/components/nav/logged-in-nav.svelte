<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Avatar from "$lib/components/ui/avatar";
	import { frontendUrls } from "types";
	import * as Menubar from "$lib/components/ui/menubar";
	import Settings from "lucide-svelte/icons/settings";
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
	<nav class="bg-secondary-500 dark:bg-secondary-900 py-4 pb-4">
		<div class="container mx-auto flex flex-row flex-wrap items-center gap-4">
			<a href={frontendUrls.ROOT}>
				<span class="self-center whitespace-nowrap text-4xl font-semibold">CodinCod</span>
			</a>

			<ul class="flex flex-1 flex-row gap-4">
				{#each navigationLinks as link}
					<li
						class="rounded-md transition-all motion-reduce:transition-none dark:hover:bg-slate-500"
					>
						<a class="px-1 py-4" href={link.href}>{link.text}</a>
					</li>
				{/each}
			</ul>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Avatar.Root>
						<Avatar.Image src="https://github.com/shadcn.png" alt="@shadcn" />
						<Avatar.Fallback>CN</Avatar.Fallback>
					</Avatar.Root>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Group>
						<DropdownMenu.Label>My Account</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item><a href={frontendUrls.USER_PROFILE}>Profile</a></DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>

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
