<script lang="ts">
	import * as HoverCard from "$lib/components/ui/hover-card";
	import Button from "@/components/ui/button/button.svelte";
	import * as Avatar from "$lib/components/ui/avatar";
	import { buildFrontendUrl, frontendUrls, type UserDto } from "types";
	import { Calendar } from "lucide-svelte";

	export let user: UserDto;

	const profileUrl = buildFrontendUrl(frontendUrls.USER_PROFILE_BY_USERNAME, {
		username: user.username
	});
</script>

<!-- TODO: fetch user info (if not provided by the puzzleDto eventually) -->
<HoverCard.Root>
	<HoverCard.Trigger
		href={profileUrl}
		target="_blank"
		rel="noreferrer noopener"
		class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
	>
		<a href={profileUrl}>
			{user.username}
		</a>
	</HoverCard.Trigger>
	<HoverCard.Content class="w-80">
		<div class="flex justify-between space-x-4">
			<Avatar.Root asChild>
				<Button
					size="icon"
					class="aspect-square rounded-full border-2 border-black dark:border-white"
					variant="outline"
				>
					<Avatar.Image
						class="rounded-full"
						src={"https://github.com/juicemitapfelndrin.png"}
						alt={user.username}
					/>
					<Avatar.Fallback>{user.username}</Avatar.Fallback>
				</Button>
			</Avatar.Root>
			<div class="space-y-1">
				<h4 class="text-sm font-semibold">{user.username}</h4>
				<p class="text-sm">Some bla bla that needs to come from the user's profile...</p>
				<div class="flex items-center pt-2">
					<Calendar class="mr-2 h-4 w-4 opacity-70" />
					<span class="text-muted-foreground text-xs">Joined September 2022</span>
				</div>
			</div>
		</div>
	</HoverCard.Content>
</HoverCard.Root>
