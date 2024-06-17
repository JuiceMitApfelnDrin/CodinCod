<script lang="ts">
	import Container from "@/components/ui/container/container.svelte";
	import H1 from "@/components/typography/h1.svelte";
	import CreatePuzzleForm from "@/features/puzzles/components/createPuzzleForm.svelte";

	export let data;
	const { form: formData } = data;

	// after creating the puzzle, you should be redirected to the edit screen for the puzzle with id (id that has been send back by backend)
</script>

<Container>
	<H1>Create a puzzle</H1>

	<!--
		should have a stepper component: 
		- 1st step: creates a "concept", which is basically this create form
		- 2nd step: edit the "concept", until it is ready to be published:
			- a publish the "concept" feature should be present when all necessary info is filled in, and the code execution process resolves to the test cases
			- a concept should be deletable?
		- 3rd step: published puzzle, when the puzzle is in a published state: 
			- it should be able to receive comments from other users
			- users should be able to propose changes
			- the solution should only be visible to the creator of the puzzle and maintainers
			- a published puzzle can return back to a "concept" state
	-->

	<CreatePuzzleForm data={formData}></CreatePuzzleForm>
</Container>
