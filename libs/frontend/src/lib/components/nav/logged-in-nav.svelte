<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Avatar from "$lib/components/ui/avatar";
	import { buildFrontendUrl, frontendUrls } from "types";
	import ToggleTheme from "./toggle-theme.svelte";
	import LogoutButton from "./logout-button.svelte";
	import { authenticatedUserInfo } from "../../stores";
	import { websiteName } from "@/config/general";
	import Button from "../ui/button/button.svelte";

	const navigationLinks = [
		{
			href: frontendUrls.ROOT,
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

	const dropdownLinksLoggedIn = $authenticatedUserInfo
		? [
				{
					href: buildFrontendUrl(frontendUrls.USER_PROFILE_BY_USERNAME, {
						username: $authenticatedUserInfo.username
					}),
					text: "Profile"
				},
				{
					href: frontendUrls.SETTINGS,
					text: "Settings"
				}
			]
		: [];
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
			</ul>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Avatar.Root asChild>
						<!-- TODO: fetch user profile picture -->
						<Button
							size="icon"
							class="rounded-full border-2 border-black dark:border-white"
							variant="outline"
							builders={[builder]}
						>
							<Avatar.Image
								class="rounded-full"
								src={"https://github.com/juicemitapfelndrin.png"}
								alt={$authenticatedUserInfo?.username}
							/>
							<Avatar.Fallback>{$authenticatedUserInfo?.username}</Avatar.Fallback>
						</Button>
					</Avatar.Root>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content>
					<DropdownMenu.Group>
						{#each dropdownLinksLoggedIn as { text, href }}
							<DropdownMenu.Item>
								<a class="h-full w-full" {href}>{text}</a>
							</DropdownMenu.Item>
						{/each}

						<DropdownMenu.Item><ToggleTheme /></DropdownMenu.Item>
						<DropdownMenu.Separator></DropdownMenu.Separator>

						<DropdownMenu.Item><LogoutButton /></DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</nav>
</header>
