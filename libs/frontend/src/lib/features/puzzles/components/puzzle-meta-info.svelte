<script lang="ts">
	import H1 from "@/components/typography/h1.svelte";
	import { formattedDateYearMonthDay } from "@/utils/date-functions";
	import { isUserDto, type EditPuzzle, type PuzzleDto } from "types";
	import UserHoverCard from "./user-hover-card.svelte";

	interface Props {
		puzzle: PuzzleDto | EditPuzzle | null;
	}

	let { puzzle }: Props = $props();

	const hasBeenUpdated = puzzle && puzzle.updatedAt !== puzzle.createdAt;
</script>

{#if puzzle}
	<div class="flex flex-col gap-2">
		<H1 class="pb-0">
			{puzzle.title}
		</H1>

		<dl class="flex gap-1 text-xs text-stone-400 dark:text-stone-600 lg:flex-row">
			{#if isUserDto(puzzle.author)}
				<dt class="font-semibold">Created by</dt>
				<dd>
					<UserHoverCard username={puzzle.author.username} />
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
