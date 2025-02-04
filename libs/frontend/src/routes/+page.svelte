<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import P from "@/components/typography/p.svelte";
	import H3 from "@/components/typography/h3.svelte";
</script>

<Container>
	<h3 class="max-w-[55ch] scroll-m-20 text-2xl font-semibold tracking-tight">
		CodinCod is a website for solving programming puzzles either on your own or while competing
		against your friends and enemies.
	</h3>

	<P class="max-w-[75ch]">
		This site is under construction &mdash; if you'd like to help check out our <a
			href="https://github.com/JuiceMitApfelnDrin/CodinCod">Github repository</a
		>! All kinds of contributions (issues, pull requests, general feedback and ideas) are welcome!
		You may also participate by chatting on
		<a href="https://twitch.tv/JuiceMitApfelnDrin">twitch.tv</a> where this project is being coded live.
	</P>

	<P class="max-w-[75ch]">
		<h3 class="max-w-[55ch] scroll-m-20 text-2xl font-semibold tracking-tight">
			When (DEFINITELY <b>NOT</b> if) CodinCod is done you will be able to:
		</h3>

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
	</P>
</Container>

<style>
	a {
		color: rgb(28, 155, 160);
		text-decoration: underline;
	}
</style>
