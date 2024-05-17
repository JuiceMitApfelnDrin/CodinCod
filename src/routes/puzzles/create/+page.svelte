<script lang="ts">
	import Container from "@/components/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import CreatePuzzleForm from "@/features/puzzles/components/createPuzzleForm.svelte";

	export let data;
	const { form: formData } = data;

	// after creating the puzzle, you should be redirected to the edit screen for the puzzle with id (id that has been send back by backend)
</script>

<Container>
	<H1>Create a puzzle</H1>

	<CreatePuzzleForm data={formData}></CreatePuzzleForm>
</Container>
