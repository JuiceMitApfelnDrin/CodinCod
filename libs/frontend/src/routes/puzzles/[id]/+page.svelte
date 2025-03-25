<script lang="ts">
	import { page } from "$app/stores";
	import Container from "@/components/ui/container/container.svelte";
	import {
		buildFrontendUrl,
		commentTypeEnum,
		frontendUrls,
		getUserIdFromUser,
		isAuthor,
		puzzleVisibilityEnum,
		type CommentDto,
		type PuzzleDto
	} from "types";
	import { authenticatedUserInfo, isAuthenticated } from "@/stores/index.js";
	import Button from "@/components/ui/button/button.svelte";
	import Accordion from "@/components/ui/accordion/accordion.svelte";
	import { cn } from "@/utils/cn.js";
	import PuzzleMetaInfo from "@/features/puzzles/components/puzzle-meta-info.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import Markdown from "@/components/typography/markdown.svelte";
	import H2 from "@/components/typography/h2.svelte";
	import Comments from "@/features/comment/components/comments.svelte";
	import AddCommentForm from "@/features/comment/components/add-comment-form.svelte";

	export let data;

	const { puzzle }: { puzzle: PuzzleDto } = data;
	$: puzzleComments = puzzle.comments ?? [];

	let puzzleId = $page.params.id;
	const editUrl = buildFrontendUrl(frontendUrls.PUZZLE_BY_ID_EDIT, { id: puzzleId });
	const playUrl = buildFrontendUrl(frontendUrls.PUZZLE_BY_ID_PLAY, { id: puzzleId });

	function onCommentAdded(newComment: CommentDto) {
		puzzleComments = [...puzzle.comments, newComment];
	}
</script>

<Container class="flex flex-col gap-4 md:gap-8 lg:gap-12">
	<LogicalUnit class="flex flex-col md:flex-row md:items-center md:justify-between">
		<PuzzleMetaInfo {puzzle} />

		<div class="flex flex-col gap-2 md:flex-row md:gap-4">
			{#if $isAuthenticated && $authenticatedUserInfo != null && isAuthor(getUserIdFromUser(puzzle.author), $authenticatedUserInfo.userId)}
				<Button variant="outline" href={editUrl}>Edit puzzle</Button>
			{/if}

			<Button href={playUrl}>Play puzzle</Button>
		</div>
	</LogicalUnit>

	<LogicalUnit class="mb-8">
		<Accordion open={true} id="statement">
			<h2 slot="title">Statement</h2>
			<div slot="content" class={cn(!puzzle.statement && "italic opacity-50")}>
				<Markdown
					markdown={puzzle.statement}
					fallbackText={"Author still needs to add a statement"}
				/>
			</div>
		</Accordion>

		<Accordion open={true} id="constraints">
			<h2 slot="title">Constraints</h2>
			<div slot="content" class={cn(!puzzle.constraints && "italic opacity-50")}>
				<Markdown
					markdown={puzzle.constraints}
					fallbackText={"Author still needs to add constraints"}
				/>
			</div>
		</Accordion>
	</LogicalUnit>

	<LogicalUnit class="flex flex-col gap-10">
		{#if puzzle.visibility === puzzleVisibilityEnum.REVIEW}
			<LogicalUnit class="flex flex-col gap-4">
				<H2>Review</H2>

				<p>This puzzle is a "work in progress", and we need your help to make it awesome.</p>
				<ul class="list-inside list-disc">
					<li><strong>What rocks:</strong> Tell us what you like about it.</li>
					<li>
						<strong>What needs a boost:</strong> Got ideas for better rules, extra challenges, or more
						tests? Share them!
					</li>
					<li>
						<strong>General thoughts:</strong> Let us know if it feels fun or if something seems off.
					</li>
				</ul>
				<p>Thanks for playing and helping us level up this puzzle!</p>
			</LogicalUnit>
		{/if}

		<H2 class="mt-8">Comments</H2>

		{#if $isAuthenticated}
			<AddCommentForm commentType={commentTypeEnum.PUZZLE} replyOnId={puzzleId} {onCommentAdded} />
		{/if}

		{#if puzzleComments.length > 0}
			<Comments comments={puzzleComments} />
		{:else}
			<p class="text-stone-400 dark:text-stone-600">No one commented yet.</p>
		{/if}
	</LogicalUnit>
</Container>

<style lang="postcss">
	h2 {
		@apply inline text-xl underline;
	}
</style>
