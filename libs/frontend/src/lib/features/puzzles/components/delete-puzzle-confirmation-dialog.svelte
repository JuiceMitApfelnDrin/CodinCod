<script lang="ts">
	import { buttonVariants } from "@/components/ui/button";
	import * as Dialog from "@/components/ui/dialog";
	import * as Form from "@/components/ui/form";
	import Input from "@/components/ui/input/input.svelte";
	import { testIds } from "@/config/test-ids";
	import { superForm, type SuperValidated } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { deletePuzzleSchema, type DeletePuzzle } from "types";

	interface Props {
		data: SuperValidated<DeletePuzzle>;
	}

	let { data }: Props = $props();

	const form = superForm(data, {
		validators: zodClient(deletePuzzleSchema)
	});

	const { enhance, form: formData } = form;
</script>

<Dialog.Root>
	<Dialog.Trigger type="button" class={buttonVariants({ variant: "outline" })}>
		Delete Puzzle
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Are you absolutely sure?</Dialog.Title>

			<form method="POST" action="?/deletePuzzle" use:enhance>
				<Form.Field {form} name="id">
					<Form.Control>
						{#snippet children({ props })}
							<Input type="hidden" {...props} bind:value={$formData.id} />
						{/snippet}
					</Form.Control>
					<Form.Description>
						This action cannot be undone. This will permanently delete your puzzle and remove this
						puzzle from our servers.
					</Form.Description>
					<Form.FieldErrors />
				</Form.Field>

				<Form.Button variant="destructive" data-testid={testIds.DELETE_PUZZLE_DIALOG_BUTTON_DELETE_PUZZLE}>Delete puzzle</Form.Button>
			</form>
		</Dialog.Header>
		<Dialog.Footer></Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
