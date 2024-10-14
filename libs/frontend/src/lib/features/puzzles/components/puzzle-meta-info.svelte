<script lang="ts">
	import H1 from "@/components/typography/h1.svelte";
	import { buildFrontendUrl } from "@/config/frontend";
	import { formattedDateYearMonthDay } from "@/utils/date-functions";
	import { frontendUrls, isUserDto, type PuzzleDto } from "types";

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
						<!-- TODO: on hover, show the user info https://www.shadcn-svelte.com/docs/components/hover-card -->
						<a
							href={buildFrontendUrl(frontendUrls.USER_PROFILE_BY_USERNAME, {
								username: puzzle.authorId.username
							})}
						>
							{puzzle.authorId.username}
						</a>
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
