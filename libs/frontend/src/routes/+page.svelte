<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import P from "@/components/typography/p.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import { githubRepo, twitchChannel } from "types";
</script>

<Container>
	<h1 class="sr-only">Home page</h1>

	<LogicalUnit class="max-w-[75ch]">
		<h2 class="max-w-[55ch] scroll-m-20 text-2xl font-semibold tracking-tight">
			CodinCod is a website for solving programming puzzles either on your own or while competing
			against your friends and enemies.
		</h2>

		<P class="max-w-[75ch]">
			This site is under construction &mdash; if you'd like to help check out our <a
				href={githubRepo}>Github repository</a
			>! All kinds of contributions (issues, pull requests, general feedback and ideas) are welcome!
			You may also participate by chatting on
			<a href={twitchChannel}>twitch.tv</a> where this project is being coded live.
		</P>
	</LogicalUnit>

	<LogicalUnit class="max-w-[75ch]">
		<h2 class="max-w-[55ch] scroll-m-20 text-2xl font-semibold tracking-tight">Features</h2>

		<P>
			When (DEFINITELY <b>NOT</b> if) CodinCod is done you will be able to:
		</P>

		<ul class="list-inside list-disc space-y-2">
			<li>
				Compete against others in real time (similar to <a
					href="https://www.codingame.com/multiplayer/clashofcode">Clash of Code</a
				>)
			</li>
			<li>Learn the basics of programming</li>
			<li>Solve puzzles on your own without time pressure (code golf, performance optimization)</li>
			<li>Contribute your own puzzles</li>
		</ul>
	</LogicalUnit>
</Container>

<style>
	a {
		color: rgb(28, 155, 160);
		text-decoration: underline;
	}
</style>
