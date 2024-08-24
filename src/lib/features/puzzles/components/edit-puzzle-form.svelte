<script lang="ts">
	import Textarea from "@/components/ui/textarea/textarea.svelte";
	import * as Form from "$lib/components/ui/form";
	import { superForm } from "sveltekit-superforms";
	import { zodClient } from "sveltekit-superforms/adapters";
	import Input from "@/components/ui/input/input.svelte";
	import InlineCode from "@/components/typography/inlineCode.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import { POST, puzzleEntitySchema } from "types";
	import { page } from "$app/stores";
	import * as Select from "$lib/components/ui/select";

	// TODO: put this somewhere central and create a place where all languages can co-exist :prayge:
	const languages = [
		{ value: "js", label: "JavaScript" },
		{ value: "ts", label: "Typescript" },
		{ value: "py", label: "Python" },
		{ value: "rb", label: "Ruby" },
		{ value: "php", label: "PHP" },
		{ value: "c#", label: "C-Sharp" }
	];

	export let data;

	const form = superForm(data.form, {
		validators: zodClient(
			puzzleEntitySchema.omit({
				authorId: true,
				createdAt: true,
				updatedAt: true
			})
		),
		dataType: "json",
		multipleSubmits: "allow",
		resetForm: false
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

	// let isAuthenticated = false;
	// let userEmail = "";
	// let userId = "";
	// onMount(() => {
	// 	console.log(data);
	// 	isAuthenticated = JSON.parse(localStorage.getItem("isAuthenticated") || "false");
	// 	userEmail = localStorage.getItem("userEmail") || "";
	// 	userId = localStorage.getItem("userId") || "";

	// 	console.log(localStorage);
	// 	console.log("Is Authenticated:", isAuthenticated);
	// 	console.log("User Email:", userEmail);
	// 	console.log("User ID:", userId);
	// });

	let { form: formData, message, enhance } = form;
</script>

{#if $message}
	<div class:success={$page.status == 200} class:error={$page.status >= 400}>
		{$message}
	</div>
{/if}

<form method={POST} use:enhance class="flex flex-col gap-4">
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
			This will be the description of the puzzle (markdown formatting supported, eventually).
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
			<InlineCode>1 ≤ n ≤ 100; 1 ≤ h ≤ 15; 0 ≤ x1 &lt; x2 ≤ 200</InlineCode>. Markdown formatting
			supported, eventually.
		</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="validators" class="flex flex-col gap-2">
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Validators</Form.Label>
			{#if $formData.validators}
				{#each $formData.validators as validator, index}
					<div class="my-4 flex items-center gap-2">
						<Input {...attrs} bind:value={$formData.validators[index].input} placeholder="Input" />
						<Input
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

	<Form.Fieldset {form} name="solution">
		<Form.Legend>Solution</Form.Legend>

		<Form.Field {form} name="solution.code">
			<Form.Control let:attrs>
				<Form.Label class="text-lg">Code</Form.Label>
				<Textarea {...attrs} bind:value={$formData.solution.code} />
			</Form.Control>
			<Form.Description
				>This is a solution to the puzzle. A way to solve and validate all validators.</Form.Description
			>
			<Form.FieldErrors />
		</Form.Field>

		<Form.Field {form} name="solution.language">
			<Form.Control let:attrs>
				<Select.Root portal={null} {...attrs}>
					<Select.Trigger class="w-[180px]">
						<Select.Value placeholder="Select a language" />
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Label class="text-lg">Language</Select.Label>
							{#each languages as language}
								<Select.Item value={language.value} label={language.label}
									>{language.label}</Select.Item
								>
							{/each}
						</Select.Group>
					</Select.Content>
					<Select.Input bind:value={$formData.solution.language} />
				</Select.Root>
			</Form.Control>
			<Form.Description
				>This is a solution to the puzzle. A way to solve and validate all validators.</Form.Description
			>
			<Form.FieldErrors />
		</Form.Field>
	</Form.Fieldset>

	<Form.Button>Update Puzzle</Form.Button>

	<!-- {#if isAuthor($formData.authorId)}
		<Button type="button" on:click={() => deletePuzzle($page.params.id)} variant={"destructive"}>
			Delete Puzzle
		</Button>
	{/if} -->
</form>
