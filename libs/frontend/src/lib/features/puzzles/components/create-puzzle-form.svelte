<script lang="ts">
	import * as Form from "$lib/components/ui/form";
	import { type SuperValidated, superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import Input from "@/components/ui/input/input.svelte";
	import { createPuzzleSchema, POST, type PuzzleEntity } from "types";

	export let data: SuperValidated<PuzzleEntity>;

	const form = superForm(data, {
		validators: zodClient(createPuzzleSchema)
	});

	const { enhance, form: formData } = form;
</script>

<form method={POST} use:enhance class="flex flex-col gap-4">
	<Form.Field {form} name="title">
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Title</Form.Label>
			<Input {...attrs} bind:value={$formData.title} />
		</Form.Control>
		<Form.Description>This will be the title of the puzzle.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button>Create Puzzle</Form.Button>
</form>
