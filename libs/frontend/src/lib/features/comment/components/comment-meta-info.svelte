<script lang="ts">
	import UserHoverCard from "@/features/puzzles/components/user-hover-card.svelte";
	import { formattedDateYearMonthDay } from "@/utils/date-functions";
	import { isUserDto, type CommentDto } from "$lib/types";

	let {
		comment
	}: {
		comment: CommentDto;
	} = $props();

	const hasBeenUpdated = comment && comment.updatedAt !== comment.createdAt;
</script>

<dl class="flex gap-1 text-sm text-stone-600 lg:flex-row dark:text-stone-400">
	{#if isUserDto(comment.author)}
		<dt class="font-semibold">Comment by</dt>
		<dd>
			<UserHoverCard username={comment.author.username} />
		</dd>
	{/if}

	<dt class="font-semibold">Written on</dt>
	<dd>
		{formattedDateYearMonthDay(comment.createdAt)}
	</dd>

	{#if hasBeenUpdated}
		<dt class="font-semibold">Updated on</dt>
		<dd>
			{formattedDateYearMonthDay(comment.createdAt)}
		</dd>
	{/if}
</dl>

<style>
	dl > dt + dd:not(:last-of-type)::after {
		content: "-";
	}
</style>
