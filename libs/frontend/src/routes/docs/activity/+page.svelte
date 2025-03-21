<script>
	import WorkInProgress from "@/components/status/work-in-progress.svelte";
	import P from "@/components/typography/p.svelte";
	import Container from "@/components/ui/container/container.svelte";
</script>

<Container>
	<P>
		<WorkInProgress />
		Activity can be seen as the following things:
	</P>
	<ul class="list-inside list-disc">
		<li>A solved puzzle</li>
		<li>Creating a puzzle</li>
	</ul>
</Container>
