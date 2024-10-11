<script lang="ts">
	import { page } from "$app/stores";
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import { buildFrontendUrl } from "@/config/frontend.js";
	import { frontendUrls, isAuthor } from "types";
	import P from "@/components/typography/p.svelte";
	import H2 from "@/components/typography/h2.svelte";
	import { authenticatedUserInfo, isAuthenticated } from "@/stores/index.js";
	import Button from "@/components/ui/button/button.svelte";
	import { formattedDateYearMonthDay } from "@/utils/date-functions";
	import Separator from "@/components/ui/separator/separator.svelte";
	import { deletePuzzle } from "@/api/delete-puzzle";
	import DeletePuzzleConfirmationDialog from "@/features/puzzles/components/delete-puzzle-confirmation-dialog.svelte";

	export let data;

	const { puzzle } = data;

	const editUrl = buildFrontendUrl(frontendUrls.PUZZLE_BY_ID_EDIT, { id: $page.params.id });
	const playUrl = buildFrontendUrl(frontendUrls.PUZZLE_BY_ID_PLAY, { id: $page.params.id });
</script>

<Container class="flex flex-col gap-2">
	<H1>
		{puzzle.title}
	</H1>

	<dl class="flex flex-col gap-1 text-xs text-gray-400 lg:flex-row dark:text-gray-600">
		<dt class="font-semibold">Created on</dt>
		<dd>
			{formattedDateYearMonthDay(puzzle.createdAt)}
		</dd>

		{#if puzzle.updatedAt !== puzzle.createdAt}
			<Separator orientation="vertical" />

			<dt class="font-semibold">Updated on</dt>
			<dd>
				{formattedDateYearMonthDay(puzzle.createdAt)}
			</dd>
		{/if}
	</dl>

	<div class="flex flex-col gap-2 md:flex-row">
		<Button href={playUrl}>Play puzzle</Button>

		{#if $isAuthenticated && $authenticatedUserInfo != null && isAuthor(puzzle.authorId._id, $authenticatedUserInfo?.userId)}
			<Button variant="secondary" href={editUrl}>Edit puzzle</Button>

			<DeletePuzzleConfirmationDialog />
		{/if}
	</div>

	{#if puzzle.statement}
		<H2>Statement</H2>
		<P>
			{puzzle.statement}
		</P>
	{/if}

	{#if puzzle.constraints}
		<H2>Constraints</H2>
		<P>
			{puzzle.constraints}
		</P>
	{/if}
</Container>
