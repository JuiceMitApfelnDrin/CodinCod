<script lang="ts">
	import UserHoverCard from "@/features/puzzles/components/user-hover-card.svelte";
	import { formattedDateYearMonthDay } from "@/utils/date-functions";
	import { isUserDto, type CommentDto } from "types";

	interface Props {
		comment: CommentDto;
	}

	let { comment }: Props = $props();

	const hasBeenUpdated = comment && comment.updatedAt !== comment.createdAt;
</script>

<dl class="flex gap-1 text-sm text-stone-600 dark:text-stone-400 lg:flex-row">
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
