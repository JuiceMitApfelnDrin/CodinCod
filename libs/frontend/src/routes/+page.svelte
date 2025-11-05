<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import P from "@/components/typography/p.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import { githubRepo, twitchChannel } from "$lib/types";
	import H1 from "@/components/typography/h1.svelte";
	import HighlightText from "@/components/ui/highlight-text/highlight-text.svelte";
</script>

<svelte:head>
	<title>Learn to Code by Solving Puzzles & Battling Players | CodinCod</title>
	<meta
		name="description"
		content="Master programming through interactive puzzles and battles. Learn Python, JavaScript, and more programming languages. Free forever."
	/>
	<meta
		name="keywords"
		content="learn programming, coding for beginners, interactive coding practice"
	/>
	<meta name="author" content="CodinCod contributors" />
</svelte:head>

<Container>
	<H1>Solve puzzles, beat friends, <HighlightText text="Get Good-er" /></H1>

	<LogicalUnit class="max-w-[75ch]">
		<h2 class="max-w-[55ch] scroll-m-20 text-2xl font-semibold tracking-tight">
			CodinCod is a website for solving programming puzzles either on your own
			or while competing against your friends and enemies.
		</h2>

		<P class="max-w-[75ch]">
			This site is under construction &mdash; if you'd like to help check out
			our <a class="styled-link" href={githubRepo}>Github repository</a>! All
			kinds of contributions (issues, pull requests, general feedback and ideas)
			are welcome! You may also participate by chatting on
			<a class="styled-link" href={twitchChannel}>twitch.tv</a> where this project
			is being coded live.
		</P>
	</LogicalUnit>

	<LogicalUnit class="max-w-[75ch]">
		<h2 class="max-w-[55ch] scroll-m-20 text-2xl font-semibold tracking-tight">
			Features
		</h2>

		<P>
			When (DEFINITELY <b>NOT</b> if) CodinCod is done you will be able to:
		</P>

		<ul class="list-inside list-disc space-y-2">
			<li>
				Compete against others in real time (similar to <a
					class="link"
					href="https://www.codingame.com/multiplayer/clashofcode"
					>Clash of Code</a
				>)
			</li>
			<li>Learn the basics of programming</li>
			<li>
				Solve puzzles on your own without time pressure (code golf, performance
				optimization)
			</li>
			<li>Contribute your own puzzles</li>
		</ul>
	</LogicalUnit>

	<LogicalUnit class="max-w-[75ch]">
		<h2 class="max-w-[55ch] scroll-m-20 text-2xl font-semibold tracking-tight">
			Why Choose CodinCod?
		</h2>

		<P>
			Unlike traditional coding platforms, CodinCod is built around <strong
				>interactive, competitive, and fun</strong
			> programming experiences. Whether you're a beginner learning loops and conditionals,
			or an expert optimizing algorithms, there's a challenge waiting for you.
		</P>

		<ul class="list-inside list-disc space-y-2">
			<li>Real-time **multiplayer** programming battles</li>
			<li>Engaging puzzles **designed by the community**</li>
			<li>Support for multiple programming languages</li>
			<li>Live coding sessions and community discussions</li>
		</ul>
	</LogicalUnit>
</Container>
