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
	import CircleArrowUp from "@lucide/svelte/icons/circle-arrow-up";
	import CircleArrowDown from "@lucide/svelte/icons/circle-arrow-down";
	import EllipsisVertical from "@lucide/svelte/icons/ellipsis-vertical";
	import MessageCircle from "@lucide/svelte/icons/message-circle";
	import MessageCircleOff from "@lucide/svelte/icons/message-circle-off";
	import Trash from "@lucide/svelte/icons/trash";
	import { fetchWithAuthenticationCookie } from "@/features/authentication/utils/fetch-with-authentication-cookie";
	import { buildBackendUrl } from "@/config/backend";
	import { backendUrls } from "types";
	import { authenticatedUserInfo, isAuthenticated } from "@/stores";
	import * as DropdownMenu from "@/components/ui/dropdown-menu";
	import { testIds } from "types";

	let {
		comment = $bindable(),
		onDeleted
	}: {
		comment: CommentDto;
		onDeleted: (commentId: ObjectId) => void;
	} = $props();

	let isReplying: boolean = $state(false);

	async function handleVote(commentVoteRequest: CommentVoteRequest) {
		const response = await fetchWithAuthenticationCookie(
			buildBackendUrl(backendUrls.commentByIdVote(comment._id)),
			{
				body: JSON.stringify(commentVoteRequest),
				method: httpRequestMethod.POST
			}
		);

		const updatedComment = await response.json();

		if (isCommentDto(updatedComment)) {
			comment = {
				...comment,
				downvote: updatedComment.downvote,
				upvote: updatedComment.upvote
			};
		}
	}

	function onCommentAdded(newComment: CommentDto) {
		const newComments = [...(comment.comments ?? []), newComment] as any[]; // unfortunately needed because recursive types are hard
		comment = {
			...comment,
			comments: newComments
		};

		isReplying = false;
	}

	async function fetchReplies() {
		const response = await fetchWithAuthenticationCookie(
			buildBackendUrl(backendUrls.commentById(comment._id)),
			{
				method: httpRequestMethod.GET
			}
		);

		const updatedCommentInfoWithSubComments = await response.json();

		if (isCommentDto(updatedCommentInfoWithSubComments)) {
			comment = {
				...comment,
				comments: [...(updatedCommentInfoWithSubComments.comments ?? [])],
				downvote: updatedCommentInfoWithSubComments.downvote,
				text: updatedCommentInfoWithSubComments.text,
				updatedAt: updatedCommentInfoWithSubComments.updatedAt,
				upvote: updatedCommentInfoWithSubComments.upvote
			};
		}
	}

	async function deleteComment() {
		await fetchWithAuthenticationCookie(
			buildBackendUrl(backendUrls.commentById(comment._id)),
			{
				method: httpRequestMethod.DELETE
			}
		);

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
					<DropdownMenu.Group class="flex flex-col">
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
