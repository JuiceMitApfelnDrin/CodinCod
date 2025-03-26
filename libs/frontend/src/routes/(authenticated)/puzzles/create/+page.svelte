<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import CreatePuzzleForm from "@/features/puzzles/components/create-puzzle-form.svelte";

	export let data;
	const { form: formData } = data;
</script>

<svelte:head>
	<title>Create a new puzzle | CodinCod</title>
</svelte:head>

<Container>
	<H1>Create a puzzle</H1>

	<CreatePuzzleForm data={formData} />
</Container>
