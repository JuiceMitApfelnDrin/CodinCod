<script lang="ts">
	import { preventDefault } from "svelte/legacy";

	import Button from "@/components/ui/button/button.svelte";
	import Label from "@/components/ui/label/label.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import Textarea from "@/components/ui/textarea/textarea.svelte";
	import { codincodApiWebPuzzleCommentControllerCreate } from "@/api/generated/default/default";
	import {
		COMMENT_CONFIG,
		commentTypeEnum,
		type CommentDto,
		type CommentType,
		type ObjectId
	} from "$lib/types";
	import { testIds } from "$lib/types";

	let {
		commentType,
		onCommentAdded,
		replyOnId
	}: {
		commentType: CommentType;
		replyOnId: ObjectId;
		onCommentAdded: (addedComment: CommentDto) => void;
	} = $props();

	let commentText: string = $state("");

	async function handleCommentType() {
		const trimmedText = commentText.trim();

		if (!trimmedText) return;

		try {
			const newComment = (await codincodApiWebPuzzleCommentControllerCreate(
				replyOnId,
				{
					text: trimmedText,
					...(commentType === commentTypeEnum.COMMENT && replyOnId
						? { replyOn: replyOnId }
						: {})
				}
			)) as unknown as CommentDto;

			onCommentAdded(newComment);
			commentText = "";
		} catch (error) {
			console.error("Failed to create comment:", error);
			// TODO: Show error to user
		}
	}
</script>

<form onsubmit={preventDefault(handleCommentType)} class="flex flex-col gap-4">
	<Label class="sr-only" for="add-comment">Add comment</Label>
	<Textarea
		maxlength={COMMENT_CONFIG.maxTextLength}
		minlength={COMMENT_CONFIG.minTextLength}
		placeholder="Share your feedback"
		id="add-comment"
		bind:value={commentText}
	/>

	{#if commentText != ""}
		<LogicalUnit>
			<Button
				data-testid={testIds.ADD_COMMENT_FORM_BUTTON_SUBMIT_NEW_COMMENT}
				type="submit"
				variant="outline"
				class="self-end">Add comment</Button
			>
			<Button
				data-testid={testIds.ADD_COMMENT_FORM_BUTTON_CANCEL_CREATING_COMMENT}
				type="reset"
				variant="outline"
				class="self-end">Cancel</Button
			>
		</LogicalUnit>
	{/if}
</form>
