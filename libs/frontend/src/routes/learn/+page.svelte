<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import P from "@/components/typography/p.svelte";
	import { buildFrontendUrl, frontendUrls } from "types";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import HighlightText from "@/components/ui/highlight-text/highlight-text.svelte";

	let { data } = $props();

	const { slugs } = data;
</script>

<svelte:head>
	<title>Learn overview | CodinCod</title>
	<meta
		name="description"
		content={`Structured coding courses with live practice. Solve puzzles, get instant feedback, and level up your skills with community mentorship. Start with a programming language or dive into algorithms.`}
	/>
	<meta
		name="keywords"
		content="learn coding online, programming courses, coding tutorials, web development basics"
	/>
	<meta name="author" content="CodinCod contributors" />
</svelte:head>

<Container>
	<H1>Let's <HighlightText text="learn" /> something today!</H1>

	<LogicalUnit>
		<P>
			This will eventually show a bunch of resources, that are free and open-source, that people can
			use to learn new different languages at their own pace and time, and look through resources
			related to code golfing, ...
		</P>
		<P>
			There should be a general language learning path with the basics e.g.: "if-else" ..., as well
			as language specific paths.
		</P>
		<P>
			Ideally, there are several levels of understanding, one that just says enough to get going
			with X (explained in a very rudimentary way, so anyone can understand), then another that goes
			a more in depth on how X works ...
			<br />
			So basically 3 levels, that expect a user to have a different understanding of the language, and
			each tailored to how much the person would like to know and understand.
		</P>

		{#if slugs}
			<ul class="list-inside list-disc">
				{#each slugs as slug}
					<li>
						<a href={buildFrontendUrl(frontendUrls.LEARN_SLUG, { slug })}>
							{slug}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</LogicalUnit>
</Container>

<style lang="postcss">
	a {
		@apply text-teal-800 underline hover:text-teal-600 dark:text-teal-200 hover:dark:text-teal-400;
	}
</style>
