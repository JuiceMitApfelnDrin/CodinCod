<script lang="ts">
	import * as HoverCard from "$lib/components/ui/hover-card";
	import Button from "@/components/ui/button/button.svelte";
	import * as Avatar from "$lib/components/ui/avatar";
	import { frontendUrls, isUserDto, type UserDto } from "types";
	import Calendar from "@lucide/svelte/icons/calendar";
	import { codincodApiWebUserControllerShow2 } from "@/api/generated/user/user";
	import type { Button as ButtonPrimitive } from "bits-ui";
	import dayjs from "dayjs";
	import { cn } from "@/utils/cn";
	import { testIds } from "types";

	let {
		class: className = undefined,
		username
	}: {
		class?: ButtonPrimitive.RootProps["class"];
		username: string;
	} = $props();

	const userInfoCache: Record<string, UserDto> = {};

	const profileUrl = frontendUrls.userProfileByUsername(username);

	async function fetchUserInfo(username: string) {
		if (userInfoCache[username]) {
			return userInfoCache[username];
		}

		const response = await codincodApiWebUserControllerShow2(username);
		userInfoCache[username] = response as UserDto;

		return response as UserDto;
	}
</script>

<HoverCard.Root>
	<HoverCard.Trigger
		href={profileUrl}
		target="_blank"
		rel="noreferrer noopener"
		class={cn(
			className,
			"rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
		)}
	>
		{username}
	</HoverCard.Trigger>
	<HoverCard.Content class="w-80">
		{#await fetchUserInfo(username)}
			loading...
		{:then user}
			{#if isUserDto(user)}
				<div class="flex justify-between space-x-4">
					<Avatar.Root>
						{#snippet child(props)}
							<Button
								data-testid={testIds.USER_HOVER_CARD_COMPONENT_ANCHOR_USER_PROFILE}
								size="icon"
								class="aspect-square rounded-full border-2 border-black dark:border-white"
								variant="outline"
								{...props}
							>
								<Avatar.Image
									class="rounded-full"
									src={user.profile?.picture}
									alt={user.username}
								/>

								<Avatar.Fallback />
							</Button>
						{/snippet}
					</Avatar.Root>
					<div class="space-y-1">
						<h4 class="text-sm font-semibold">{user.username}</h4>
						{#if user.profile}
							<p class="text-sm">{user.profile.bio}</p>
						{/if}

						<div class="flex items-center pt-2">
							<Calendar class="mr-2 h-4 w-4 opacity-70" />
							<span class="text-muted-foreground text-xs"
								>Joined {dayjs(user.createdAt).format("MMMM YYYY")}</span
							>
						</div>
					</div>
				</div>
			{/if}
		{:catch}
			couldn't fetch user info
		{/await}
	</HoverCard.Content>
</HoverCard.Root>
