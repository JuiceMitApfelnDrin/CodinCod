<script lang="ts">
	import { isCommentDto, type CommentDto, type ObjectId } from "types";
	import Comment from "./comment.svelte";

	interface Props {
		comments: (CommentDto | string)[];
	}

	let { comments = $bindable() }: Props = $props();

	function onDeletedComment(commentId: ObjectId) {
		comments = comments.filter((comment) => {
			if (isCommentDto(comment)) {
				return comment._id != commentId;
			} else {
				return comment === commentId;
			}
		});
	}
</script>

{#if comments.length > 0}
	{#if comments.every((comment) => {
		return isCommentDto(comment);
	})}
		<ul class="mt-6 flex flex-col gap-4">
			{#each comments as comment}
				<Comment {comment} onDeleted={onDeletedComment} />
			{/each}
		</ul>
	{:else}
		{@const commentDtos = comments.filter((comment) => {
			return isCommentDto(comment);
		})}

		{#if commentDtos.length > 0}
			<ul class="mt-6 flex flex-col gap-4">
				{#each commentDtos as comment}
					<Comment {comment} onDeleted={onDeletedComment} />
				{/each}
			</ul>
		{/if}
	{/if}
{/if}
