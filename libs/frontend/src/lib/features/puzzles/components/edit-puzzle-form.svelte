<script lang="ts">
	import Textarea from "@/components/ui/textarea/textarea.svelte";
	import * as Form from "$lib/components/ui/form";
	import { superForm, type SuperValidated } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import Input from "@/components/ui/input/input.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import {
		buildFrontendUrl,
		DEFAULT_LANGUAGE,
		frontendUrls,
		POST,
		puzzleEntitySchema,
		PuzzleVisibilityEnum,
		type EditPuzzle,
		type PuzzleLanguage,
		type PuzzleVisibility
	} from "types";
	import { page } from "$app/stores";
	import * as Select from "$lib/components/ui/select";
	import P from "@/components/typography/p.svelte";
	import GenericAlert from "@/components/ui/alert/generic-alert.svelte";
	import { isHttpErrorCode } from "@/utils/is-http-error-code";
	import { ScrollArea } from "@/components/ui/scroll-area";
	import LanguageSelect from "./language-select.svelte";

	export let data: SuperValidated<EditPuzzle>;

	const learnMarkdownUrl = buildFrontendUrl(frontendUrls.LEARN_MARKDOWN);

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
				input: "",
				output: ""
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

	let { enhance, form: formData, message } = form;

	let language: PuzzleLanguage = "";
	$: {
		language = $formData.solution.language;
	}

	function setLanguage(newLanguage: PuzzleLanguage) {
		language = newLanguage;
	}

	let visibilityStates: PuzzleVisibility[] = Object.values(PuzzleVisibilityEnum);
</script>

<form method={POST} action="?/editPuzzle" use:enhance class="flex flex-col gap-4">
	<Form.Field {form} name="title">
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Title</Form.Label>
			<Input {...attrs} bind:value={$formData.title} />
		</Form.Control>
		<Form.Description>
			This will be shown as the name of the puzzle. A good title is both unique and descriptive.
		</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="statement">
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Statement</Form.Label>
			<Textarea {...attrs} bind:value={$formData.statement} />
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
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Constraints</Form.Label>
			<Textarea {...attrs} bind:value={$formData.constraints} />
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
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Validators</Form.Label>
			{#if $formData.validators}
				{#each $formData.validators as _, index}
					<div class="my-4 flex gap-2">
						<Textarea
							{...attrs}
							bind:value={$formData.validators[index].input}
							placeholder="Input"
						/>
						<Textarea
							{...attrs}
							bind:value={$formData.validators[index].output}
							placeholder="Output"
						/>
						<Button type="button" on:click={() => removeValidator(index)}>Remove</Button>
					</div>
				{/each}
			{/if}
			<div class="flex items-center">
				<Button type="button" on:click={addValidator}>Add Validator</Button>
			</div>
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
			<Form.Control let:attrs>
				<Form.Label class="text-lg">Language</Form.Label>

				<LanguageSelect formAttributes={attrs} {language} {setLanguage} />
			</Form.Control>
			<Form.Description>Programming language used for the solution.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="solution.code">
			<Form.Control let:attrs>
				<Form.Label class="text-lg">Code</Form.Label>
				<Textarea {...attrs} bind:value={$formData.solution.code} />
			</Form.Control>
			<Form.Description>This is for the code that tests the puzzle.</Form.Description>
			<Form.FieldErrors />
		</Form.Field>
	</Form.Fieldset>

	<Form.Field {form} name="visibility">
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Visibility</Form.Label>
			<Select.Root
				selected={{ label: $formData.visibility, value: $formData.visibility }}
				onSelectedChange={(v) => {
					if (v) {
						$formData.visibility = v.value;
					}
				}}
			>
				<Select.Trigger class="w-[180px]" {...attrs}>
					<Select.Value placeholder="Select a visibility" />
				</Select.Trigger>
				<Select.Content>
					<Select.Group>
						{#each visibilityStates as visibilityState}
							<Select.Item value={visibilityState} label={visibilityState} />
						{/each}
					</Select.Group>
				</Select.Content>
				<Select.Input bind:value={$formData.visibility} name={attrs.name} />
			</Select.Root>
		</Form.Control>
		<Form.Description>
			At the moment you get to decide the visibility of your puzzle. In the future there will be a
			review process to get a puzzle approved.
		</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	{#if $message}
		<GenericAlert
			title={isHttpErrorCode($page.status)
				? "Error whilst trying to updating the puzzle"
				: "Updated the puzzle"}
			status={$page.status}
			message={$message}
		/>
	{/if}

	<Form.Button>Update Puzzle</Form.Button>
</form>
