<script lang="ts">
	import { superForm, type SuperValidated } from "sveltekit-superforms";
	import * as Form from "$lib/components/ui/form";
	import { Input } from "@/components/ui/input";
	import { registerFormSchema, type RegisterFormSchema } from "../config/register-form-schema";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { debounce } from "@/utils/debounce";
	import { PASSWORD_CONFIG, POST, USERNAME_CONFIG } from "types";

	export let data: SuperValidated<RegisterFormSchema>;

	const form = superForm(data.data, {
		validators: zodClient(registerFormSchema)
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
	<Form.Field {form} name="username" class="w-full">
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Username</Form.Label>
			<Input {...attrs} bind:value={$formData.username} placeholder="john_doe123" />
		</Form.Control>
		<Form.Description
			>Username must be {USERNAME_CONFIG.minUsernameLength}-{USERNAME_CONFIG.maxUsernameLength} characters
			long and can include letters, numbers, hyphens, and underscores.</Form.Description
		>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="email" class="w-full">
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Email</Form.Label>
			<Input {...attrs} bind:value={$formData.email} placeholder="john@example.com" />
		</Form.Control>
		<Form.Description>Email must be a valid email address.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="password" class="w-full">
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Password</Form.Label>
			<Input
				type="password"
				{...attrs}
				bind:value={$formData.password}
				placeholder={`${PASSWORD_CONFIG.minPasswordLength}characters`}
			/>
		</Form.Control>
		<Form.Description
			>Password must be at least {PASSWORD_CONFIG.minPasswordLength} characters.
			<span class="text-xs"
				>(If you are interested to know
				<a href="https://bitwarden.com/blog/how-long-should-my-password-be/">why</a>.)</span
			></Form.Description
		>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button>Register</Form.Button>
</form>
