<script>
	import WorkInProgress from "@/components/status/work-in-progress.svelte";
	import P from "@/components/typography/p.svelte";
	import Container from "@/components/ui/container/container.svelte";
</script>

<Container>
	<P>
		<WorkInProgress />
		Activity can be accumulated through the following actions:
	</P>

	<ul class="list-inside list-disc">
		<li>Solving a puzzle</li>
		<li>Creating a puzzle</li>
		<li>Creating your account</li>
	</ul>
</Container>
