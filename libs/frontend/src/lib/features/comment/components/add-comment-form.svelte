<script lang="ts">
	import { preventDefault } from "svelte/legacy";

	import Button from "@/components/ui/button/button.svelte";
	import Label from "@/components/ui/label/label.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import Textarea from "@/components/ui/textarea/textarea.svelte";
	import { apiUrls } from "@/config/api";
	import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
	import {
		COMMENT_CONFIG,
		commentTypeEnum,
		httpRequestMethod,
		type CommentDto,
		type CommentType,
		type CreateComment,
		type ObjectId
	} from "types";
	import { testIds } from "@/config/test-ids";

	interface Props {
		commentType: CommentType;
		replyOnId: ObjectId;
		onCommentAdded: (addedComment: CommentDto) => void;
	}

	let { commentType, onCommentAdded, replyOnId }: Props = $props();

	let commentText: string = $state("");

	async function handleCommentType() {
		const createComment: CreateComment = {
			replyOn: replyOnId,
			text: commentText.trim()
		};

		let response: Response;

		switch (commentType) {
			case commentTypeEnum.PUZZLE:
				response = await fetchWithAuthenticationCookie(apiUrls.puzzleByIdComment(replyOnId), {
					body: JSON.stringify(createComment),
					method: httpRequestMethod.POST
				});
				break;
			case commentTypeEnum.COMMENT:
				response = await fetchWithAuthenticationCookie(apiUrls.puzzleByIdComment(replyOnId), {
					body: JSON.stringify(createComment),
					method: httpRequestMethod.POST
				});
				break;
			default:
				return;
		}

		const newComment = await response.json();

		onCommentAdded(newComment);

		commentText = "";
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
