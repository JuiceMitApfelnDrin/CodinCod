<script lang="ts">
	import * as DropdownMenu from "#/ui/dropdown-menu";
	import * as Avatar from "#/ui/avatar";
	import { buildFrontendUrl, frontendUrls } from "types";
	import { testIds } from "@/config/test-ids";
	import { authenticatedUserInfo } from "@/stores";
	import { Button } from "#/ui/button";
</script>

{#if $authenticatedUserInfo?.isAuthenticated}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger>
			{#snippet child({ props: avatarProps })}
				<Avatar.Root {...avatarProps}>
					{#snippet child({ props })}
						<Button
							data-testid={testIds.NAVIGATION_MENU_BUTTON_OPEN}
							size="icon"
							class="rounded-full border-2 border-black dark:border-white"
							variant="outline"
							{...props}
						>
							<Avatar.Image
								class="rounded-full"
								src={undefined}
								alt={$authenticatedUserInfo?.username}
							/>
							<Avatar.Fallback />
						</Button>
					{/snippet}
				</Avatar.Root>
			{/snippet}
		</DropdownMenu.Trigger>

		<DropdownMenu.Content>
			<DropdownMenu.Group>
				{@const profileLink = buildFrontendUrl(frontendUrls.USER_PROFILE_BY_USERNAME, {
					username: $authenticatedUserInfo.username
				})}
				<DropdownMenu.Item>
					{#snippet child(props)}
						<a data-testid={testIds.NAVIGATION_MENU_ANCHOR_PROFILE} href={profileLink} {...props}
							>Profile</a
						>
					{/snippet}
				</DropdownMenu.Item>
				<DropdownMenu.Item>
					{#snippet child(props)}
						<a
							data-testid={testIds.NAVIGATION_MENU_ANCHOR_SETTINGS}
							href={frontendUrls.SETTINGS_PROFILE}
							{...props}>Settings</a
						>
					{/snippet}
				</DropdownMenu.Item>

				<DropdownMenu.Separator />

				<DropdownMenu.Item>
					{#snippet child(props)}
						<a
							data-testid={testIds.NAVIGATION_MENU_ANCHOR_LOGOUT}
							href={frontendUrls.LOGOUT}
							{...props}>Log out</a
						>
					{/snippet}
				</DropdownMenu.Item>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
