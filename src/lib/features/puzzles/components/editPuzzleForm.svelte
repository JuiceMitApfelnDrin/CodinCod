<script lang="ts">
	import Textarea from "@/components/ui/textarea/textarea.svelte";
	import * as Form from "$lib/components/ui/form";
	import { type SuperValidated, type Infer, superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import Input from "@/components/ui/input/input.svelte";
	import { editPuzzleFormSchema, type EditPuzzleFormSchema } from "../config/editPuzzleFormSchema";
	import InlineCode from "@/components/typography/inlineCode.svelte";
	import Button from "@/components/ui/button/button.svelte";

	export let data: SuperValidated<Infer<EditPuzzleFormSchema>>;

	const form = superForm(data, {
		validators: zodClient(editPuzzleFormSchema)
	});

	function addValidator() {
		const validatorsIsUndefinedOrNull = Boolean(!formData.validators);
		if (validatorsIsUndefinedOrNull) {
			formData.validators = [];
		}

		formData.validators.push({
			input: "",
			output: ""
		});
	}

	function removeValidator(index: number) {
		formData.validators.splice(index, 1);
	}

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
			This will be the description of the puzzle (markdown formatting supported).
		</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="constraints">
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Constraints</Form.Label>
			<Textarea {...attrs} bind:value={$formData.constraints} />
		</Form.Control>
		<Form.Description>
			Describe to the best of your abilities what the puzzle is limited to, e.g.: <InlineCode
				>1 ≤ n ≤ 100; 1 ≤ h ≤ 15; 0 ≤ x1 &lt; x2 ≤ 200</InlineCode
			>. Markdown formatting supported.
		</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="validators">
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Validators</Form.Label>
			{#if formData.validators}
				{#each formData.validators as validator, index}
					<div class="mb-2 flex items-center">
						<Input {...attrs} bind:value={formData.validators[index].input} />
						<Input {...attrs} bind:value={formData.validators[index].output} />
						<Button on:click={() => removeValidator(index)}>Remove validator</Button>
					</div>
				{/each}
			{/if}
			<div class="flex items-center">
				<button type="button" on:click={addValidator}>Add Validator</button>
			</div>
		</Form.Control>
		<Form.Description>Input and output validators.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button>Update Puzzle</Form.Button>
</form>
