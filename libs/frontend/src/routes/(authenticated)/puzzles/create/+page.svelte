<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import CreatePuzzleForm from "@/features/puzzles/components/create-puzzle-form.svelte";

	export let data;
	const { form: formData } = data;
</script>

<svelte:head>
	<title>Create a new puzzle | CodinCod</title>
	<meta
		name="description"
		content="Build and share your coding puzzles with the world. Get feedback, iterate, and earn recognition in our developer community."
	/>
	<meta name="author" content="CodinCod contributors" />
</svelte:head>

<Container>
	<H1>Create a puzzle</H1>

	<CreatePuzzleForm data={formData} />
</Container>
