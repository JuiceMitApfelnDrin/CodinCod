<script lang="ts">
	import { page } from "$app/stores";
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import { buildFrontendUrl } from "@/config/frontend.js";
	import { frontendUrls, isAuthor } from "types";
	import P from "@/components/typography/p.svelte";
	import H2 from "@/components/typography/h2.svelte";
	import { authenticatedUserInfo, isAuthenticated } from "@/stores/index.js";

	export let data;

	const { puzzle } = data;

	const editUrl = buildFrontendUrl(frontendUrls.PUZZLE_BY_ID_EDIT, { id: $page.params.id });
	const playUrl = buildFrontendUrl(frontendUrls.PUZZLE_BY_ID_PLAY, { id: $page.params.id });
</script>

<Container class="flex flex-col gap-2">
	<H1>
		{puzzle.title}
	</H1>
	<P>puzzle was created on: {puzzle.createdAt}, and last update happened on: {puzzle.updatedAt}</P>

	{#if $isAuthenticated && $authenticatedUserInfo != null && isAuthor(puzzle.authorId._id, $authenticatedUserInfo?.userId)}
		<a href={editUrl}>Edit puzzle</a>
	{/if}
	<a href={playUrl}>Play puzzle</a>

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
