<script lang="ts">
	import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
	import * as Avatar from "$lib/components/ui/avatar";
	import { buildFrontendUrl, frontendUrls, type Link } from "types";
	import { authenticatedUserInfo } from "../../stores";
	import Button from "../ui/button/button.svelte";
	import { testIds } from "@/config/test-ids";
</script>

{#if $authenticatedUserInfo?.isAuthenticated}
	<DropdownMenu.Root>
		<DropdownMenu.Trigger asChild>
			{#snippet children({ builder })}
				<Avatar.Root asChild>
					<Button
						data-testid={testIds.NAVIGATION_MENU_BUTTON_OPEN}
						size="icon"
						class="rounded-full border-2 border-black dark:border-white"
						variant="outline"
						builders={[builder]}
					>
						<Avatar.Image
							class="rounded-full"
							src={undefined}
							alt={$authenticatedUserInfo?.username}
						/>
						<Avatar.Fallback />
					</Button>
				</Avatar.Root>
			{/snippet}
		</DropdownMenu.Trigger>

		<DropdownMenu.Content>
			<DropdownMenu.Group>
				{@const profileLink = buildFrontendUrl(frontendUrls.USER_PROFILE_BY_USERNAME, {
					username: $authenticatedUserInfo.username
				})}
				<DropdownMenu.Item data-testid={testIds.NAVIGATION_MENU_ANCHOR_PROFILE} href={profileLink}>
					Profile
				</DropdownMenu.Item>
				<DropdownMenu.Item
					data-testid={testIds.NAVIGATION_MENU_ANCHOR_SETTINGS}
					href={frontendUrls.SETTINGS_PROFILE}
				>
					Settings
				</DropdownMenu.Item>

				<DropdownMenu.Separator />

				<DropdownMenu.Item
					data-testid={testIds.NAVIGATION_MENU_ANCHOR_LOGOUT}
					href={frontendUrls.LOGOUT}
				>
					Log out
				</DropdownMenu.Item>
			</DropdownMenu.Group>
		</DropdownMenu.Content>
	</DropdownMenu.Root>
{/if}
