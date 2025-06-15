<script lang="ts">
	import * as Form from "$lib/components/ui/form";
	import { type SuperValidated, superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import Input from "@/components/ui/input/input.svelte";
	import { createPuzzleSchema, POST, type CreatePuzzle } from "types";
	import GenericAlert from "@/components/ui/alert/generic-alert.svelte";
	import { isHttpErrorCode } from "@/utils/is-http-error-code";
	import { page } from "$app/stores";
	import { testIds } from "@/config/test-ids";

	interface Props {
		data: SuperValidated<CreatePuzzle>;
	}

	let { data }: Props = $props();

	const form = superForm(data, {
		validators: zodClient(createPuzzleSchema)
	});

	const { enhance, form: formData, message } = form;
</script>

<form method={POST} use:enhance class="flex flex-col gap-4">
	<Form.Field {form} name="title">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-lg">Title</Form.Label>
				<Input {...props} bind:value={$formData.title} />
			{/snippet}
		</Form.Control>
		<Form.Description>This will be the title of the puzzle.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	{#if $message}
		<GenericAlert
			title={isHttpErrorCode($page.status)
				? "Error whilst trying to create the puzzle"
				: "Created the puzzle"}
			status={$page.status}
			message={$message}
		/>
	{/if}

	<Form.Button data-testid={testIds.CREATE_PUZZLE_FORM_BUTTON_CREATE_PUZZLE}>
		Create Puzzle
	</Form.Button>
</form>
