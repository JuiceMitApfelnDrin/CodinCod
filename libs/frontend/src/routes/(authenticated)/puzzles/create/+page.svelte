<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import CreatePuzzleForm from "@/features/puzzles/components/create-puzzle-form.svelte";

	export let data;
	const { form: formData } = data;
</script>

<Container>
	<H1 class="my-8 pb-0">Create a puzzle</H1>

	<CreatePuzzleForm data={formData}></CreatePuzzleForm>
</Container>
