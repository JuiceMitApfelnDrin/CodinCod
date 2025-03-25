<script lang="ts">
	import Button from "@/components/ui/button/button.svelte";
	import Label from "@/components/ui/label/label.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import Textarea from "@/components/ui/textarea/textarea.svelte";
	import { apiUrls, buildApiUrl } from "@/config/api";
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

	export let commentType: CommentType;
	export let replyOnId: ObjectId;
	export let onCommentAdded: (addedComment: CommentDto) => void;

	let commentText: string = "";

	async function handleCommentType() {
		const createComment: CreateComment = {
			replyOn: replyOnId,
			text: commentText.trim()
		};

		let response: Response;

		switch (commentType) {
			case commentTypeEnum.PUZZLE:
				response = await fetchWithAuthenticationCookie(
					buildApiUrl(apiUrls.PUZZLE_BY_ID_COMMENT, { id: replyOnId }),
					{
						body: JSON.stringify(createComment),
						method: httpRequestMethod.POST
					}
				);
				break;
			case commentTypeEnum.COMMENT:
				response = await fetchWithAuthenticationCookie(
					buildApiUrl(apiUrls.COMMENT_BY_ID_COMMENT, { id: replyOnId }),
					{
						body: JSON.stringify(createComment),
						method: httpRequestMethod.POST
					}
				);
				break;
			default:
				return;
		}

		const newComment = await response.json();

		onCommentAdded(newComment);

		commentText = "";
	}
</script>

<form on:submit|preventDefault={handleCommentType} class="flex flex-col gap-4">
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
			<Button type="submit" variant="outline" class="self-end">Add comment</Button>
			<Button type="reset" variant="outline" class="self-end">Cancel</Button>
		</LogicalUnit>
	{/if}
</form>
