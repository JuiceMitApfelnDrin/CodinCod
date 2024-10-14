<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Avatar from "$lib/components/ui/avatar";
	import { frontendUrls } from "types";
	import ToggleTheme from "./toggle-theme.svelte";
	import LogoutButton from "./logout-button.svelte";
	import { authenticatedUserInfo } from "../../stores";
	import { websiteName } from "@/config/general";
	import { buildFrontendUrl } from "@/config/frontend";
	import Button from "../ui/button/button.svelte";

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
						<DropdownMenu.Label>My Account</DropdownMenu.Label>
						<DropdownMenu.Separator />
						{#if $authenticatedUserInfo}
							<DropdownMenu.Item>
								<a
									href={buildFrontendUrl(frontendUrls.USER_PROFILE_BY_USERNAME, {
										username: $authenticatedUserInfo.username
									})}
								>
									Profile
								</a>
							</DropdownMenu.Item>
						{/if}
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
