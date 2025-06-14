<script lang="ts">
	import * as HoverCard from "$lib/components/ui/hover-card";
	import Button from "@/components/ui/button/button.svelte";
	import * as Avatar from "$lib/components/ui/avatar";
	import { buildFrontendUrl, frontendUrls, isUserDto, type UserDto } from "types";
	import { Calendar } from "@lucide/svelte";
	import { apiUrls, buildApiUrl } from "@/config/api";
	import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
	import type { Button as ButtonPrimitive } from "bits-ui";
	import dayjs from "dayjs";
	import { cn } from "@/utils/cn";

	interface Props {
		class?: ButtonPrimitive.RootProps["class"];
		username: string;
	}

	let { class: className = undefined, username }: Props = $props();

	const userInfoCache: Record<string, UserDto> = {};

	const profileUrl = buildFrontendUrl(frontendUrls.USER_PROFILE_BY_USERNAME, {
		username
	});

	async function fetchUserInfo(username: string) {
		if (userInfoCache[username]) {
			return userInfoCache[username];
		}

		let url = buildApiUrl(apiUrls.USER_BY_USERNAME, { username });

		const response = await fetchWithAuthenticationCookie(url).then((res) => res.json());

		userInfoCache[username] = response;

		return response;
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
		{:then { user }}
			{#if isUserDto(user)}
				<div class="flex justify-between space-x-4">
					<Avatar.Root>
						{#snippet child(props)}
							<Button
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
