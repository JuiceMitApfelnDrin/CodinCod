<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Avatar from "$lib/components/ui/avatar";
	import { buildFrontendUrl, frontendUrls, type FrontendLink, type Link } from "types";
	import { authenticatedUserInfo } from "../../stores";
	import Button from "../ui/button/button.svelte";

	const dropdownLinksLoggedIn: Link[] = $authenticatedUserInfo
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

			<DropdownMenu.Separator></DropdownMenu.Separator>

			<DropdownMenu.Item>
				<a class="h-full w-full" href="/logout"> Log out </a>
			</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
