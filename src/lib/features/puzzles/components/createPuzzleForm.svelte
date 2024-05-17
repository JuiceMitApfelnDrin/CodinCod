<script lang="ts">
	import Textarea from "@/components/ui/textarea/textarea.svelte";
	import * as Form from "$lib/components/ui/form";
	import { type SuperValidated, type Infer, superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import Input from "@/components/ui/input/input.svelte";
	import {
		createPuzzleFormSchema,
		type CreatePuzzleFormSchema
	} from "../config/createPuzzleFormSchema";

	export let data: SuperValidated<Infer<CreatePuzzleFormSchema>>;

	const form = superForm(data, {
		validators: zodClient(createPuzzleFormSchema)
	});

	const { form: formData, enhance } = form;
</script>

<form method="POST" use:enhance>
	<Form.Field {form} name="title">
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Title</Form.Label>
			<Input {...attrs} bind:value={$formData.title} />
		</Form.Control>
		<Form.Description>This will be the title of the puzzle.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="statement">
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Statement</Form.Label>
			<Textarea {...attrs} bind:value={$formData.statement} />
		</Form.Control>
		<Form.Description>
			This will be the description of the puzzle. Markdown formatting supported.
		</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button>Create Puzzle</Form.Button>
</form>
