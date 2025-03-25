<script lang="ts">
	import {
		commentTypeEnum,
		httpRequestMethod,
		isCommentDto,
		voteTypeEnum,
		type CommentDto,
		type CommentVoteRequest
	} from "types";
	import CommentMetaInfo from "./comment-meta-info.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import Comments from "./comments.svelte";
	import AddCommentForm from "./add-comment-form.svelte";
	import { CircleArrowDown, CircleArrowUp, MessageCircle, MessageCircleOff } from "lucide-svelte";
	import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
	import { apiUrls, buildApiUrl } from "@/config/api";

	export let comment: CommentDto;

	let isReplying: boolean = false;

	async function handleVote(commentVoteRequest: CommentVoteRequest) {
		const response = await fetchWithAuthenticationCookie(
			buildApiUrl(apiUrls.COMMENT_BY_ID_VOTE, { id: comment._id }),
			{
				body: JSON.stringify(commentVoteRequest),
				method: httpRequestMethod.POST
			}
		);

		const updatedComment = await response.json();

		if (isCommentDto(updatedComment)) {
			comment = { ...comment, upvote: updatedComment.upvote, downvote: updatedComment.downvote };
		}
	}

	function onCommentAdded(newComment: CommentDto) {
		comment = { ...comment, comments: [...comment.comments, newComment] };

		isReplying = false;
	}

	async function fetchReplies() {
		const response = await fetchWithAuthenticationCookie(
			buildApiUrl(apiUrls.COMMENT_BY_ID, { id: comment._id }),
			{
				method: httpRequestMethod.GET
			}
		);

		const updatedCommentInfoWithSubComments = await response.json();

		if (isCommentDto(updatedCommentInfoWithSubComments)) {
			comment = {
				...comment,
				comments: [...updatedCommentInfoWithSubComments.comments],
				upvote: updatedCommentInfoWithSubComments.upvote,
				downvote: updatedCommentInfoWithSubComments.downvote,
				updatedAt: updatedCommentInfoWithSubComments.updatedAt,
				text: updatedCommentInfoWithSubComments.text
			};
		}
	}
</script>

<li class="flex w-fit flex-col gap-4 rounded-lg border px-6 py-4">
	<CommentMetaInfo {comment} />

	<p class="max-w-[75ch]">
		{comment.text}
	</p>

	<LogicalUnit class="flex flex-row gap-2">
		{#if isReplying}
			<Button
				variant="outline"
				on:click={() => {
					isReplying = false;
				}}
			>
				<MessageCircleOff class="mr-2 size-4" /> Hide
			</Button>
		{:else}
			<Button
				variant="outline"
				on:click={() => {
					isReplying = true;
				}}
			>
				<MessageCircle class="mr-2 size-4" /> Reply
			</Button>
		{/if}

		<Button
			variant="outline"
			on:click={() => {
				handleVote({ type: voteTypeEnum.UPVOTE });
			}}
		>
			<CircleArrowUp class="mr-2 size-4" />
			{comment.upvote} upvotes
		</Button>
		<Button
			variant="outline"
			on:click={() => {
				handleVote({ type: voteTypeEnum.DOWNVOTE });
			}}
		>
			<CircleArrowDown class="mr-2 size-4" />
			{comment.downvote} downvotes
		</Button>
	</LogicalUnit>

	{#if isReplying}
		<AddCommentForm
			replyOnId={comment._id}
			commentType={commentTypeEnum.COMMENT}
			{onCommentAdded}
		/>
	{/if}

	{#if comment.comments && comment.comments.length > 0}
		<Comments comments={comment.comments} />

		{#if comment.comments.some((comment) => {
			return !isCommentDto(comment);
		})}
			<Button
				variant="outline"
				on:click={() => {
					fetchReplies();
				}}
			>
				Show replies...
			</Button>
		{/if}
	{/if}
</li>
