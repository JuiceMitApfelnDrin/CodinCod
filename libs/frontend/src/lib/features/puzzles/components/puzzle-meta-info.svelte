<script lang="ts">
	import H1 from "@/components/typography/h1.svelte";
	import { buildFrontendUrl } from "@/config/frontend";
	import { formattedDateYearMonthDay } from "@/utils/date-functions";
	import { frontendUrls, isUserDto, type PuzzleDto } from "types";
	import * as HoverCard from "$lib/components/ui/hover-card";
	import Button from "@/components/ui/button/button.svelte";
	import * as Avatar from "$lib/components/ui/avatar";
	import { Calendar } from "lucide-svelte";
	import { authenticatedUserInfo } from "@/stores";

	export let puzzle: PuzzleDto | null;

	const hasBeenUpdated = puzzle && puzzle.updatedAt !== puzzle.createdAt;
</script>

{#if puzzle}
	<div class="flex flex-col gap-2">
		<H1 class="pb-0">
			{puzzle.title}
		</H1>

		<dl class="flex gap-1 text-xs text-gray-400 lg:flex-row dark:text-gray-600">
			{#if isUserDto(puzzle.authorId)}
				<dt class="font-semibold">Created by</dt>
				<dd>
					{#if puzzle.authorId._id}
						<!-- TODO: fetch user info (if not provided by the puzzleDto eventually) -->

						<HoverCard.Root>
							<HoverCard.Trigger
								href="https://github.com/sveltejs"
								target="_blank"
								rel="noreferrer noopener"
								class="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-black"
							>
								<a
									href={buildFrontendUrl(frontendUrls.USER_PROFILE_BY_USERNAME, {
										username: puzzle.authorId.username
									})}
								>
									{puzzle.authorId.username}
								</a>
							</HoverCard.Trigger>
							<HoverCard.Content class="w-80">
								<div class="flex justify-between space-x-4">
									<Avatar.Root asChild>
										<Button
											size="icon"
											class="rounded-full border-2 border-black dark:border-white"
											variant="outline"
										>
											<Avatar.Image
												class="rounded-full"
												src={"https://github.com/juicemitapfelndrin.png"}
												alt={$authenticatedUserInfo?.username}
											/>
											<Avatar.Fallback>{$authenticatedUserInfo?.username}</Avatar.Fallback>
										</Button>
									</Avatar.Root>
									<div class="space-y-1">
										<h4 class="text-sm font-semibold">{puzzle.authorId.username}</h4>
										<p class="text-sm">Cybernetically enhanced web apps.</p>
										<div class="flex items-center pt-2">
											<Calendar class="mr-2 h-4 w-4 opacity-70" />
											<span class="text-muted-foreground text-xs"> Joined September 2022 </span>
										</div>
									</div>
								</div>
							</HoverCard.Content>
						</HoverCard.Root>
					{:else}
						{puzzle.authorId.username}
					{/if}
				</dd>
			{/if}

			<dt class="font-semibold">Created on</dt>
			<dd>
				{formattedDateYearMonthDay(puzzle.createdAt)}
			</dd>

			{#if hasBeenUpdated}
				<dt class="font-semibold">Updated on</dt>
				<dd>
					{formattedDateYearMonthDay(puzzle.createdAt)}
				</dd>
			{/if}
		</dl>
	</div>
{/if}

<style>
	dl > dt + dd:not(:last-of-type)::after {
		content: "-";
	}
</style>
