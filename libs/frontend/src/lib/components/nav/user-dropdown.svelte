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
			<!-- TODO: fetch user profile picture or get it from token -->
			<Button
				size="icon"
				class="rounded-full border-2 border-black dark:border-white"
				variant="outline"
				builders={[builder]}
			>
				<Avatar.Image class="rounded-full" src={undefined} alt={$authenticatedUserInfo?.username} />
				<Avatar.Fallback />
			</Button>
		</Avatar.Root>
	</DropdownMenu.Trigger>

	<DropdownMenu.Content>
		<DropdownMenu.Group>
			{#each dropdownLinksLoggedIn as { text, href }}
				<DropdownMenu.Item {href}>
					{text}
				</DropdownMenu.Item>
			{/each}

			<DropdownMenu.Separator></DropdownMenu.Separator>

			<DropdownMenu.Item href={frontendUrls.LOGOUT}>Log out</DropdownMenu.Item>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
