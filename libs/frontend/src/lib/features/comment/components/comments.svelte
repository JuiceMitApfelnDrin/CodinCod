<script lang="ts">
	import { isCommentDto, type CommentDto } from "types";
	import Comment from "./comment.svelte";

	export let comments: (CommentDto | string)[];
</script>

{#if comments.every((comment) => {
	return isCommentDto(comment);
})}
	<ul class="mt-6 flex flex-col gap-4">
		{#each comments as comment}
			<Comment {comment} />
		{/each}
	</ul>
{:else}
	{@const commentDtos = comments.filter((comment) => {
		return isCommentDto(comment);
	})}

	{#if commentDtos.length > 0}
		<ul class="mt-6 flex flex-col gap-4">
			{#each commentDtos as comment}
				<Comment {comment} />
			{/each}
		</ul>
	{/if}
{/if}
