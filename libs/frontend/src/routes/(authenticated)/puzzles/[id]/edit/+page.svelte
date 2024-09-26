<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import EditPuzzleForm from "@/features/puzzles/components/edit-puzzle-form.svelte";

	export let data;
</script>

<Container class="h-full gap-4">
	<H1>Edit your puzzle</H1>

	<EditPuzzleForm {data}></EditPuzzleForm>
</Container>
