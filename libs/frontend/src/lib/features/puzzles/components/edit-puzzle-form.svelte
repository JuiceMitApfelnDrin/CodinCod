<script lang="ts">
	import Textarea from "@/components/ui/textarea/textarea.svelte";
	import * as Form from "$lib/components/ui/form";
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import Input from "@/components/ui/input/input.svelte";
	import InlineCode from "@/components/typography/inlineCode.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import { POST, puzzleEntitySchema, type PuzzleLanguage } from "types";
	import { page } from "$app/stores";
	import * as Select from "$lib/components/ui/select";
	import P from "@/components/typography/p.svelte";
	import GenericAlert from "@/components/ui/alert/generic-alert.svelte";
	import { isHttpErrorCode } from "@/utils/is-http-error-code";
	import { fetchSupportedLanguages } from "@/utils/fetch-supported-languages";
	import { onMount } from "svelte";

	export let data;

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

	let languages: PuzzleLanguage[] = [];
	let language: PuzzleLanguage = $formData.solution.language ?? "";

	async function fetchLanguages() {
		languages = await fetchSupportedLanguages();

		const defaultLanguage = languages[0];
		language = defaultLanguage;
	}

	onMount(() => {
		fetchLanguages();
	});
</script>

<form method={POST} action="?/editPuzzle" use:enhance class="flex flex-col gap-4">
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
			Describe to the best of your abilities what the puzzle is limited to, e.g.:
			<InlineCode>1 ≤ n ≤ 100; 1 ≤ h ≤ 15; 0 ≤ x1 &lt; x2 ≤ 200</InlineCode>. (Markdown formatting
			supported).
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
		<Form.Description>Input and output validators.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Fieldset
		{form}
		name="solution"
		class="my-8 flex flex-col gap-4 rounded-lg border border-black p-8 dark:border-white"
	>
		<Form.Legend class="px-4 text-3xl">Solution</Form.Legend>

		<P>
			This is where you create a solution to this puzzle. A way to solve and validate all
			validators.
		</P>

		<Form.Field {form} name="solution.language">
			<Form.Control let:attrs>
				<Form.Label class="text-lg">Language</Form.Label>
				<Select.Root
					selected={{ label: language, value: language }}
					onSelectedChange={(v) => {
						if (v) {
							language = v.value;
						}
					}}
				>
					<Select.Trigger class="w-[180px]" {...attrs}>
						<Select.Value placeholder="Select a language" />
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							{#each languages as language}
								<Select.Item value={language} label={language} />
							{/each}
						</Select.Group>
					</Select.Content>
					<Select.Input bind:value={$formData.solution.language} name={attrs.name} />
				</Select.Root>
			</Form.Control>
			<Form.Description
				>This is the language the code to solve the puzzles will is written in.</Form.Description
			>
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

	<GenericAlert
		title={isHttpErrorCode($page.status)
			? "Error whilst trying to updating the puzzle"
			: "Updated the puzzle"}
		status={$page.status}
		message={$message}
	/>

	<Form.Button>Update Puzzle</Form.Button>
</form>
