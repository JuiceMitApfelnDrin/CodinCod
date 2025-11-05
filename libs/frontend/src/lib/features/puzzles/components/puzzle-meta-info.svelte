<script lang="ts">
	import H1 from "@/components/typography/h1.svelte";
	import { formattedDateYearMonthDay } from "@/utils/date-functions";
	import UserHoverCard from "./user-hover-card.svelte";
	import type { PuzzleResponse } from "@/api/generated/schemas";
	import type { PuzzleDto, EditPuzzle } from "types";

	let {
		puzzle
	}: {
		puzzle:	PuzzleResponse | PuzzleDto | EditPuzzle | null;
	} = $props();

	const hasBeenUpdated = puzzle && puzzle.updatedAt !== puzzle.createdAt;

	// Helper to safely get author username
	const getAuthorUsername = (author: unknown): string | undefined => {
		if (!author) return undefined;
		if (typeof author === "object" && "username" in author) {
			return author.username as string;
		}
		return undefined;
	};

	const authorUsername = $derived(
		puzzle?.author ? getAuthorUsername(puzzle.author) : undefined
	);
</script>

{#if puzzle}
	<div class="flex flex-col gap-2">
		<H1 class="pb-0">
			{puzzle.title ?? "Untitled Puzzle"}
		</H1>

		<dl
			class="flex gap-1 text-xs text-stone-400 lg:flex-row dark:text-stone-600"
		>
			{#if authorUsername}
				<dt class="font-semibold">Created by</dt>
				<dd>
					<UserHoverCard username={authorUsername} />
				</dd>
			{/if}

			{#if puzzle.createdAt}
				<dt class="font-semibold">Created on</dt>
				<dd>
					{formattedDateYearMonthDay(puzzle.createdAt as string | Date)}
				</dd>
			{/if}

			{#if hasBeenUpdated && puzzle.updatedAt}
				<dt class="font-semibold">Updated on</dt>
				<dd>
					{formattedDateYearMonthDay(puzzle.updatedAt as string | Date)}
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
