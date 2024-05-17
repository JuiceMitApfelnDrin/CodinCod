<script lang="ts">
	import { page } from "$app/stores";
	import Container from "@/components/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import { urls, buildLocalUrl } from "@/config/routes";

	export let data;

	const { puzzle } = data;

	const editUrl = buildLocalUrl(urls.puzzle_by_id_edit, { id: $page.params.id });
</script>

<Container>
	<H1>
		{puzzle.title}
	</H1>

	<a href={editUrl}><Button>Edit puzzle</Button></a>

	<p>
		{puzzle.statement}
	</p>
</Container>
