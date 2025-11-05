<script lang="ts">
	import {
		commentTypeEnum,
		getUserIdFromUser,
		isAuthor,
		isCommentDto,
		type CommentDto,
		type ObjectId
	} from "$lib/types";
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
	import {
		codincodApiWebCommentControllerVote,
		codincodApiWebCommentControllerShow,
		codincodApiWebCommentControllerDelete
	} from "@/api/generated/default/default";
	import { VoteRequestType } from "@/api/generated/schemas/voteRequestType";
	import type { VoteRequest } from "@/api/generated/schemas/voteRequest";
	import { authenticatedUserInfo, isAuthenticated } from "@/stores/auth.store";
	import * as DropdownMenu from "@/components/ui/dropdown-menu";
	import { testIds } from "$lib/types";

	let {
		comment = $bindable(),
		onDeleted
	}: {
		comment: CommentDto;
		onDeleted: (commentId: ObjectId) => void;
	} = $props();

	let isReplying: boolean = $state(false);

	async function handleVote(commentVoteRequest: VoteRequest) {
		const updatedComment = await codincodApiWebCommentControllerVote(
			comment._id,
			commentVoteRequest
		);

		if (isCommentDto(updatedComment)) {
			comment = {
				...comment,
				downvote: updatedComment.downvote,
				upvote: updatedComment.upvote
			};
		}
	}

	function onCommentAdded(newComment: CommentDto) {
		const newComments = [...(comment.comments ?? []), newComment._id];
		comment = {
			...comment,
			comments: newComments
		};

		isReplying = false;
	}

	async function fetchReplies() {
		const updatedCommentInfoWithSubComments =
			await codincodApiWebCommentControllerShow(comment._id);

		if (isCommentDto(updatedCommentInfoWithSubComments)) {
			comment = {
				...comment,
				comments: updatedCommentInfoWithSubComments.comments ?? [],
				downvote: updatedCommentInfoWithSubComments.downvote,
				text: updatedCommentInfoWithSubComments.text,
				updatedAt: updatedCommentInfoWithSubComments.updatedAt,
				upvote: updatedCommentInfoWithSubComments.upvote
			};
		}
	}

	async function deleteComment() {
		await codincodApiWebCommentControllerDelete(comment._id);
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
				handleVote({ type: VoteRequestType.upvote });
			}}
		>
			<CircleArrowUp class="mr-2 size-4" />
			{comment.upvote} upvotes
		</Button>
		<Button
			data-testid={testIds.COMMENT_COMPONENT_BUTTON_DOWNVOTE_COMMENT}
			variant="outline"
			onclick={() => {
				handleVote({ type: VoteRequestType.downvote });
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
