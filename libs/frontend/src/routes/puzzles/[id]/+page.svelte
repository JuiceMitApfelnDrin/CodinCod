<script lang="ts">
	import { page } from "$app/stores";
	import Container from "@/components/ui/container/container.svelte";
	import { buildFrontendUrl, frontendUrls, isAuthor } from "types";
	import { authenticatedUserInfo, isAuthenticated } from "@/stores/index.js";
	import Button from "@/components/ui/button/button.svelte";
	import Accordion from "@/components/ui/accordion/accordion.svelte";
	import { cn } from "@/utils/cn.js";
	import PuzzleMetaInfo from "@/features/puzzles/components/puzzle-meta-info.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import Markdown from "@/components/typography/markdown.svelte";

	export let data;

	const { puzzle } = data;

	const editUrl = buildFrontendUrl(frontendUrls.PUZZLE_BY_ID_EDIT, { id: $page.params.id });
	const playUrl = buildFrontendUrl(frontendUrls.PUZZLE_BY_ID_PLAY, { id: $page.params.id });
</script>

<Container class="flex flex-col gap-4 md:gap-8 lg:gap-12">
	<LogicalUnit class="flex flex-col md:flex-row md:items-center md:justify-between">
		<PuzzleMetaInfo {puzzle} />

		<div class="flex flex-col gap-2 md:flex-row md:gap-4">
			{#if $isAuthenticated && $authenticatedUserInfo != null && isAuthor(puzzle.authorId._id, $authenticatedUserInfo?.userId)}
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
</Container>

<style>
	h2 {
		@apply inline text-xl underline;
	}
</style>
