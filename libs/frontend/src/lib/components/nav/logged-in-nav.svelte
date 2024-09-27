<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Avatar from "$lib/components/ui/avatar";
	import { frontendUrls } from "types";
	import ToggleTheme from "./toggle-theme.svelte";
	import LogoutButton from "./logout-button.svelte";
	import { authenticatedUserInfo } from "../../stores";

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
	<nav
		class="bg-teal-300 bg-gradient-to-b from-teal-100 py-6 text-teal-950 dark:bg-teal-800 dark:from-teal-950 dark:text-teal-100"
	>
		<div class="container mx-auto flex flex-row flex-wrap items-end gap-8">
			<a href={frontendUrls.ROOT}>
				<span class="self-center whitespace-nowrap text-4xl font-bold">CodinCod</span>
			</a>

			<ul class="flex flex-1 flex-row gap-4">
				{#each navigationLinks as link}
					<li
						class="rounded-md transition-all motion-reduce:transition-none dark:hover:bg-gray-500"
					>
						<a class="px-1 py-4" href={link.href}>{link.text}</a>
					</li>
				{/each}
			</ul>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<Avatar.Root>
						<!-- TODO: fetch user profile picture -->
						<Avatar.Image
							class="rounded-full border-2 border-black dark:border-white"
							src={"https://github.com/reeveng.png"}
							alt={$authenticatedUserInfo?.username}
						/>
						<Avatar.Fallback>{$authenticatedUserInfo?.username}</Avatar.Fallback>
					</Avatar.Root>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Group>
						<DropdownMenu.Label>My Account</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item>
							<a href={frontendUrls.USER_PROFILE}>Profile</a>
						</DropdownMenu.Item>
						<DropdownMenu.Item>
							<a href={frontendUrls.SETTINGS}>Preferences</a>
						</DropdownMenu.Item>
						<DropdownMenu.Item><LogoutButton /></DropdownMenu.Item>

						<DropdownMenu.Separator></DropdownMenu.Separator>

						<DropdownMenu.Item><ToggleTheme /></DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</nav>
</header>
