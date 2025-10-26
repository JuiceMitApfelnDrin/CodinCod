<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import {
		commentTypeEnum,
		frontendUrls,
		getUserIdFromUser,
		isAuthor,
		isUserDto,
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
	import { testIds } from "@/config/test-ids";
	import { page } from "$app/state";

	let { data } = $props();

	const { puzzle }: { puzzle: PuzzleDto } = data;
	let puzzleComments = $derived(puzzle.comments ?? []);

	let puzzleId = page.params.id ?? "";
	const editUrl = frontendUrls.puzzleByIdEdit(puzzleId);
	const playUrl = frontendUrls.puzzleByIdPlay(puzzleId);

	function onCommentAdded(newComment: CommentDto) {
		puzzleComments = [...puzzle.comments, newComment] []; // unfortunately needed because recursive types are hard
	}
</script>

<svelte:head>
	<title
		>Learn a programming language by solving {puzzle.title} | CodinCod</title
	>
	<meta
		name="description"
		content={`Learn programming fundamentals with this puzzle named: ${puzzle.title}. Compete against others, test your solution, to improve your coding skills.`}
	/>
	<meta name="keywords" content="coding exercises, problem-solving skills" />
	{#if isUserDto(puzzle.author)}
		<meta name="author" content={`${puzzle.author.username}`} />
	{:else}
		<meta name="author" content="CodinCod contributors" />
	{/if}
</svelte:head>

<Container class="flex flex-col gap-4 md:gap-8 lg:gap-12">
	<LogicalUnit
		class="flex flex-col md:flex-row md:items-center md:justify-between"
	>
		<PuzzleMetaInfo {puzzle} />

		<div class="flex flex-col gap-2 md:flex-row md:gap-4">
			{#if $isAuthenticated && $authenticatedUserInfo != null && isAuthor(getUserIdFromUser(puzzle.author), $authenticatedUserInfo.userId)}
				<Button
					data-testid={testIds.PUZZLES_BY_ID_PAGE_ANCHOR_EDIT_PUZZLE}
					variant="outline"
					href={editUrl}
				>
					Edit puzzle
				</Button>
			{/if}

			<Button
				data-testid={testIds.PUZZLES_BY_ID_PAGE_ANCHOR_PLAY_PUZZLE}
				href={playUrl}
			>
				Play puzzle
			</Button>
		</div>
	</LogicalUnit>

	<LogicalUnit class="mb-8">
		<Accordion open={true} id="statement">
			{#snippet title()}
				<h2>Statement</h2>
			{/snippet}
			{#snippet content()}
				<div class={cn(!puzzle.statement && "italic opacity-50")}>
					<Markdown
						markdown={puzzle.statement}
						fallbackText="Author still needs to add a statement"
					/>
				</div>
			{/snippet}
		</Accordion>

		<Accordion open={true} id="constraints">
			{#snippet title()}
				<h2>Constraints</h2>
			{/snippet}
			{#snippet content()}
				<div class={cn(!puzzle.constraints && "italic opacity-50")}>
					<Markdown
						markdown={puzzle.constraints}
						fallbackText="Author still needs to add constraints"
					/>
				</div>
			{/snippet}
		</Accordion>
	</LogicalUnit>

	<LogicalUnit class="flex flex-col gap-10">
		{#if puzzle.visibility === puzzleVisibilityEnum.REVIEW}
			<LogicalUnit class="flex flex-col gap-4">
				<H2>Review</H2>

				<p>
					This puzzle is a "work in progress", and we need your help to make it
					awesome.
				</p>
				<ul class="list-inside list-disc">
					<li><strong>What rocks:</strong> Tell us what you like about it.</li>
					<li>
						<strong>What needs a boost:</strong> Got ideas for better rules, extra
						challenges, or more tests? Share them!
					</li>
					<li>
						<strong>General thoughts:</strong> Let us know if it feels fun or if
						something seems off.
					</li>
				</ul>
				<p>Thanks for playing and helping us level up this puzzle!</p>
			</LogicalUnit>
		{/if}

		<H2 class="mt-8">Comments</H2>

		{#if $isAuthenticated}
			<AddCommentForm
				commentType={commentTypeEnum.PUZZLE}
				replyOnId={puzzleId}
				{onCommentAdded}
			/>
		{/if}

		{#if puzzleComments.length > 0}
			<Comments comments={puzzleComments} />
		{:else}
			<p class="text-stone-400 dark:text-stone-600">No one commented yet.</p>
		{/if}
	</LogicalUnit>
</Container>

<style lang="postcss">
	@import "tailwindcss" reference;

	h2 {
		@apply inline text-xl underline;
	}
</style>
