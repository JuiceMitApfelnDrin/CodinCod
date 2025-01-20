<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import P from "@/components/typography/p.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import LogicalUnit from "@/components/ui/logical-unit/logical-unit.svelte";
	import { Button } from "@/components/ui/button";
	import { frontendUrls } from "types";
</script>

<Container>
	<H1>Discover</H1>

	<LogicalUnit>
		<P>
			This will eventually show an overview of the currently ongoing games and/or games that haven't
			started yet.<br />You will be able to:
		</P>
		<ul class="list-inside list-disc space-y-2">
			<li><Button variant="outline" href={frontendUrls.MULTIPLAYER}>1v1</Button></li>
			<li><Button variant="outline" href={frontendUrls.MULTIPLAYER}>1vX</Button></li>
			<li>puzzle golfing</li>
			<li>optimize puzzles in terms of speed/time/...</li>
		</ul>
	</LogicalUnit>
</Container>
