<script lang="ts">
	import {
		commentTypeEnum,
		getUserIdFromUser,
		httpRequestMethod,
		isAuthor,
		isCommentDto,
		voteTypeEnum,
		type CommentDto,
		type CommentVoteRequest,
		type ObjectId
	} from "types";
	import CommentMetaInfo from "./comment-meta-info.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import Comments from "./comments.svelte";
	import AddCommentForm from "./add-comment-form.svelte";
	import {
		CircleArrowDown,
		CircleArrowUp,
		EllipsisVertical,
		MessageCircle,
		MessageCircleOff,
		Trash
	} from "@lucide/svelte";
	import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
	import { apiUrls, buildApiUrl } from "@/config/api";
	import { authenticatedUserInfo, isAuthenticated } from "@/stores";
	import * as DropdownMenu from "@/components/ui/dropdown-menu";
	import { testIds } from "@/config/test-ids";

	interface Props {
		comment: CommentDto;
		onDeleted: (commentId: ObjectId) => void;
	}

	let { comment = $bindable(), onDeleted }: Props = $props();

	let isReplying: boolean = $state(false);

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

	async function deleteComment() {
		await fetchWithAuthenticationCookie(buildApiUrl(apiUrls.COMMENT_BY_ID, { id: comment._id }), {
			method: httpRequestMethod.DELETE
		});

		onDeleted(comment._id);
	}
</script>

<li class="flex w-fit flex-col gap-4 rounded-lg border px-6 py-4">
	<LogicalUnit class="flex flex-row justify-between gap-2">
		<CommentMetaInfo {comment} />

		{#if $authenticatedUserInfo?.userId && isAuthor(getUserIdFromUser(comment.author), $authenticatedUserInfo.userId)}
			<DropdownMenu.Root>
				<DropdownMenu.Trigger>
					<EllipsisVertical class="mr-2 size-4" aria-label="Actions" />
				</DropdownMenu.Trigger>

				<DropdownMenu.Content>
					<DropdownMenu.Group>
						<DropdownMenu.Item onclick={deleteComment}>
							<Trash class="mr-2 size-4" aria-hidden="true" /> Delete
						</DropdownMenu.Item>
					</DropdownMenu.Group>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		{/if}
	</LogicalUnit>

	<p class="max-w-[75ch]">
		{comment.text}
	</p>

	<LogicalUnit class="flex flex-row gap-2">
		{#if isReplying}
			<Button
				data-testid={testIds.COMMENT_COMPONENT_BUTTON_HIDE_COMMENT}
				variant="outline"
				onclick={() => {
					isReplying = false;
				}}
			>
				<MessageCircleOff class="mr-2 size-4" /> Hide
			</Button>
		{:else}
			<Button
				data-testid={testIds.COMMENT_COMPONENT_BUTTON_REPLY_TO_COMMENT}
				variant="outline"
				onclick={() => {
					isReplying = true;
				}}
			>
				<MessageCircle class="mr-2 size-4" /> Reply
			</Button>
		{/if}

		<Button
			data-testid={testIds.COMMENT_COMPONENT_BUTTON_UPVOTE_COMMENT}
			variant="outline"
			onclick={() => {
				handleVote({ type: voteTypeEnum.UPVOTE });
			}}
		>
			<CircleArrowUp class="mr-2 size-4" />
			{comment.upvote} upvotes
		</Button>
		<Button
			data-testid={testIds.COMMENT_COMPONENT_BUTTON_DOWNVOTE_COMMENT}
			variant="outline"
			onclick={() => {
				handleVote({ type: voteTypeEnum.DOWNVOTE });
			}}
		>
			<CircleArrowDown class="mr-2 size-4" />
			{comment.downvote} downvotes
		</Button>
	</LogicalUnit>

	{#if isReplying && $isAuthenticated}
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
				data-testid={testIds.COMMENT_COMPONENT_BUTTON_SHOW_REPLIES}
				variant="outline"
				onclick={() => {
					fetchReplies();
				}}
			>
				Show replies...
			</Button>
		{/if}
	{/if}
</li>
