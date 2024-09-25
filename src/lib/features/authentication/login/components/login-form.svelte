<script lang="ts">
	import { superForm, type SuperValidated } from "sveltekit-superforms";
	import * as Form from "$lib/components/ui/form";
	import { Input } from "@/components/ui/input";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { debounce } from "@/utils/debounce";
	import { type Login, loginSchema, POST } from "types";

	export let data: SuperValidated<Login>;

	const form = superForm(data.data, {
		validators: zodClient(loginSchema)
	});

	const { enhance, form: formData, message, validateForm } = form;

	const handleFormInput = debounce(async () => {
		await validateForm({ update: false });
	}, 500);
</script>

{#if $message}<h3>{$message}</h3>{/if}

<form
	method={POST}
	use:enhance
	class="my-5 flex flex-col items-center gap-5"
	on:input={handleFormInput}
>
	<Form.Field {form} name="identifier" class="w-full">
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Username or email</Form.Label>
			<Input {...attrs} bind:value={$formData.identifier} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="password" class="w-full">
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Password</Form.Label>
			<Input type="password" {...attrs} bind:value={$formData.password} />
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button>Login</Form.Button>
</form>
