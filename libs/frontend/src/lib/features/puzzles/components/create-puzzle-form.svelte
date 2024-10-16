<script lang="ts">
	import * as Form from "$lib/components/ui/form";
	import { type SuperValidated, superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import Input from "@/components/ui/input/input.svelte";
	import { createPuzzleSchema, POST, type CreatePuzzle } from "types";
	import GenericAlert from "@/components/ui/alert/generic-alert.svelte";
	import { isHttpErrorCode } from "@/utils/is-http-error-code";
	import { page } from "$app/stores";

	export let data: SuperValidated<CreatePuzzle>;

	const form = superForm(data, {
		validators: zodClient(createPuzzleSchema)
	});

	const { enhance, form: formData, message } = form;
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

	<GenericAlert
		title={isHttpErrorCode($page.status)
			? "Error whilst trying to create the puzzle"
			: "Created the puzzle"}
		status={$page.status}
		message={$message}
	/>

	<Form.Button>Create Puzzle</Form.Button>
</form>
