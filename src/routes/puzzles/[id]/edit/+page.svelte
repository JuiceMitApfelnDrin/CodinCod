<script lang="ts">
	import Container from "@/components/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import EditPuzzleForm from "@/features/puzzles/components/editPuzzleForm.svelte";

	export let data;
	const { form: formData } = data;
	const { puzzle } = data;
</script>

<Container class="gap-4">
	<H1>Edit your puzzle</H1>

	<EditPuzzleForm data={formData}></EditPuzzleForm>
</Container>
