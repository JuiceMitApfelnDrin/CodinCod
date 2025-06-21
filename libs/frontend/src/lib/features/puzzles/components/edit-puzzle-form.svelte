<script lang="ts">
	import Textarea from "@/components/ui/textarea/textarea.svelte";
	import * as Form from "$lib/components/ui/form";
	import { superForm, type SuperValidated } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import Input from "@/components/ui/input/input.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import {
		frontendUrls,
		POST,
		PUZZLE_CONFIG,
		puzzleEntitySchema,
		puzzleVisibilityEnum,
		type EditPuzzle,
		type PuzzleVisibility
	} from "types";
	import { page } from "$app/state";
	import * as Select from "$lib/components/ui/select";
	import P from "@/components/typography/p.svelte";
	import GenericAlert from "@/components/ui/alert/generic-alert.svelte";
	import { isHttpErrorCode } from "@/utils/is-http-error-code";
	import LanguageSelect from "./language-select.svelte";
	import Codemirror from "@/features/game/components/codemirror.svelte";
	import { languages } from "@/stores/languages";
	import { testIds } from "@/config/test-ids";

	interface Props {
		data: SuperValidated<EditPuzzle>;
	}

	let { data }: Props = $props();

	const learnMarkdownUrl = frontendUrls.LEARN_MARKDOWN;

	const form = superForm(data, {
		dataType: "json",
		multipleSubmits: "allow",
		resetForm: false,
		validators: zodClient(
			puzzleEntitySchema.omit({
				author: true,
				createdAt: true,
				updatedAt: true
			})
		)
	});

	function addValidator() {
		formData.update(($form) => {
			if (!$form.validators) {
				$form.validators = [];
			}

			$form.validators.push({
				createdAt: new Date(),
				input: "",
				output: "",
				updatedAt: new Date()
			});

			return $form;
		});
	}

	function removeValidator(index: number) {
		formData.update(($form) => {
			if ($form.validators && $form.validators?.length > 0) {
				$form.validators.splice(index, 1);
			}
			return $form;
		});
	}

	$effect(() => {
		if (!$formData.solution) {
			$formData.solution = {
				code: "",
				language: "",
				languageVersion: ""
			};
		}

		if (!$formData.solution?.language) {
			$formData.solution.language = "";
		}

		if (!$formData.solution?.code) {
			$formData.solution.code = "";
		}
	});

	let { enhance, form: formData, message } = form;

	let visibilityStates: PuzzleVisibility[] = Object.values(puzzleVisibilityEnum);

	const triggerContent = $derived($formData.visibility ?? "Select a visibility");
</script>

<form method={POST} action="?/editPuzzle" use:enhance class="flex flex-col gap-4">
	<Form.Field {form} name="title">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-lg">Title</Form.Label>
				<Input {...props} bind:value={$formData.title} />
			{/snippet}
		</Form.Control>
		<Form.Description>
			This will be shown as the name of the puzzle. A good title is both unique and descriptive.
		</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="statement">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-lg">Statement</Form.Label>
				<Textarea {...props} bind:value={$formData.statement} />
			{/snippet}
		</Form.Control>
		<Form.Description>
			Describe the puzzle in enough detail to make it possible for players to understand and solve
			it. The description should contain answers to questions such as: What are the inputs of the
			puzzle? How are they formatted? What are the outputs of the puzzle? If there are decimal
			numbers, how should they be rounded?
			<a class="link" href={learnMarkdownUrl}>Markdown formatting is supported.</a>
		</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="constraints">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-lg">Constraints</Form.Label>
				<Textarea {...props} bind:value={$formData.constraints} />
			{/snippet}
		</Form.Control>
		<Form.Description>
			Constraints should describe the limits for the input values, for example "1 ≤ N ≤ 100" or "S
			contains only letters a to z and numbers 0 to 9". Sometimes it is useful to give constraints
			for the output as well, for example to clarify that the answer will fit in a 32-bit integer.
			<a class="link" href={learnMarkdownUrl}>Markdown formatting is supported.</a>
		</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="validators" class="flex flex-col gap-2">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-lg">Validators</Form.Label>

				<Form.Description>
					To ensure high-quality puzzles and effective test cases, we require a <strong
						>minimum</strong
					>
					of <strong>{PUZZLE_CONFIG.requiredNumberOfValidators} test cases</strong> before the puzzle
					can move on to the next stage of the review process.
				</Form.Description>

				{#if $formData.validators}
					{#each $formData.validators as _, index}
						<div class="my-4 flex gap-2">
							<Textarea
								{...props}
								bind:value={$formData.validators[index].input}
								placeholder="Input"
							/>
							<Textarea
								{...props}
								bind:value={$formData.validators[index].output}
								placeholder="Output"
							/>
							<Button
								data-testid={testIds.EDIT_PUZZLE_FORM_BUTTON_REMOVE_VALIDATOR}
								type="button"
								onclick={() => removeValidator(index)}>Remove</Button
							>
						</div>
					{/each}
				{/if}
				<div class="flex items-center">
					<Button
						data-testid={testIds.EDIT_PUZZLE_FORM_BUTTON_ADD_VALIDATOR}
						type="button"
						onclick={addValidator}>Add Validator</Button
					>
				</div>
			{/snippet}
		</Form.Control>
		<Form.Description>
			Validators are the test cases for your puzzle. Please make sure that the validators cover all
			the edge cases that are allowed by the constraints.
		</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Fieldset
		{form}
		name="solution"
		class="my-8 flex flex-col gap-4 rounded-lg border border-black p-8 dark:border-white"
	>
		<Form.Legend class="px-4 text-3xl">Solution</Form.Legend>

		<P>Please provide a valid solution for your puzzle. It will be used to check the validators.</P>

		<Form.Field {form} name="solution.language">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label class="text-lg">Language</Form.Label>

					<LanguageSelect
						formAttributes={props}
						bind:language={$formData.solution.language}
						languages={$languages ?? []}
					/>
				{/snippet}
			</Form.Control>
			<Form.Description>Programming language used for the solution.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="solution.code">
			<Form.Control>
				{#snippet children({ props })}
					<Form.Label class="text-lg">Code</Form.Label>

					<Codemirror language={$formData.solution.language} bind:value={$formData.solution.code} />
					<Input
						class="sr-only"
						aria-hidden="true"
						{...props}
						bind:value={$formData.solution.code}
					/>
				{/snippet}
			</Form.Control>
			<Form.Description>This is for the code that tests the puzzle.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
	</Form.Fieldset>

	<Form.Field {form} name="visibility">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-lg">Visibility</Form.Label>
				<!-- TODO: check if this works without it, otherwise put it back:
				  onValueChange={(v) => {
					if (v && isPuzzleVisibilityState(v)) {
						$formData.visibility = v;
					}
				}} -->
				<Select.Root type="single" bind:value={$formData.visibility} name={props.name}>
					<Select.Trigger class="w-[180px]" {...props}>
						{triggerContent}
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							{#each visibilityStates as visibilityState}
								<Select.Item value={visibilityState} label={visibilityState} />
							{/each}
						</Select.Group>
					</Select.Content>
				</Select.Root>
			{/snippet}
		</Form.Control>
		<Form.Description>
			At the moment you get to decide the visibility of your puzzle. In the future there will be a
			review process to get a puzzle approved.
		</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	{#if $message}
		<GenericAlert
			title={isHttpErrorCode(page.status)
				? "Error whilst trying to updating the puzzle"
				: "Updated the puzzle"}
			status={page.status}
			message={$message}
		/>
	{/if}

	<Form.Button data-testid={testIds.EDIT_PUZZLE_FORM_BUTTON_UPDATE_PUZZLE}
		>Update Puzzle</Form.Button
	>
</form>
