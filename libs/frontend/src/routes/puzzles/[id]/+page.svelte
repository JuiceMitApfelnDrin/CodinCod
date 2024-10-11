<script lang="ts">
	import { page } from "$app/stores";
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import { buildFrontendUrl } from "@/config/frontend.js";
	import { frontendUrls, isAuthor, isUserDto } from "types";
	import { authenticatedUserInfo, isAuthenticated } from "@/stores/index.js";
	import Button from "@/components/ui/button/button.svelte";
	import { formattedDateYearMonthDay } from "@/utils/date-functions";
	import Separator from "@/components/ui/separator/separator.svelte";
	import Accordion from "@/components/ui/accordion/accordion.svelte";
	import { cn } from "@/utils/cn.js";

	export let data;

	const { puzzle } = data;

	const editUrl = buildFrontendUrl(frontendUrls.PUZZLE_BY_ID_EDIT, { id: $page.params.id });
	const playUrl = buildFrontendUrl(frontendUrls.PUZZLE_BY_ID_PLAY, { id: $page.params.id });
</script>

<Container class="flex flex-col gap-2">
	<div class="flex flex-col md:flex-row md:items-center md:justify-between">
		<div class="my-8 flex flex-col gap-2">
			<H1 class="pb-0">
				{puzzle.title}
			</H1>

			<dl class="flex gap-1 text-xs text-gray-400 lg:flex-row dark:text-gray-600">
				{#if isUserDto(puzzle.authorId)}
					<dt class="font-semibold">Created by</dt>
					<dd>
						{#if puzzle.authorId._id}
							<!-- TODO: on hover, show the user info https://www.shadcn-svelte.com/docs/components/hover-card -->
							<a
								href={buildFrontendUrl(frontendUrls.USER_PROFILE_BY_USERNAME, {
									username: puzzle.authorId.username
								})}
							>
								{puzzle.authorId.username}
							</a>
						{:else}
							{puzzle.authorId.username}
						{/if}
					</dd>

					<Separator orientation="vertical" />
				{/if}

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
		</div>

		<div class="flex flex-col gap-2 md:flex-row md:gap-4">
			{#if $isAuthenticated && $authenticatedUserInfo != null && isAuthor(puzzle.authorId._id, $authenticatedUserInfo?.userId)}
				<Button variant="outline" href={editUrl}>Edit puzzle</Button>
			{/if}

			<Button href={playUrl}>Play puzzle</Button>
		</div>
	</div>

	<div class="mb-8">
		<Accordion open={true} id="statement">
			<h2 slot="title">Statement</h2>
			<p slot="content" class={cn(!puzzle.statement && "italic opacity-50")}>
				{puzzle.statement ?? "Author still needs to add a statement"}
			</p>
		</Accordion>

		<Accordion open={true} id="constraints">
			<h2 slot="title">Constraints</h2>
			<p slot="content" class={cn(!puzzle.constraints && "italic opacity-50")}>
				{puzzle.constraints ?? "Author still needs to add a constraints"}
			</p>
		</Accordion>
	</div>
</Container>

<style>
	h2 {
		@apply inline text-xl underline;
	}
</style>
