<script lang="ts">
	import { superForm, type SuperValidated } from "sveltekit-superforms";
	import * as Form from "$lib/components/ui/form";
	import { Input } from "@/components/ui/input";
	import { registerFormSchema, type RegisterForm } from "../config/register-form-schema";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { debounce } from "@/utils/debounce";
	import { PASSWORD_CONFIG, POST, USERNAME_CONFIG } from "types";
	import * as Alert from "@/components/ui/alert";
	import { CircleAlert } from "lucide-svelte";

	export let data: SuperValidated<RegisterForm>;
	export let message: string = "";

	const form = superForm(data.data, {
		validators: zodClient(registerFormSchema)
	});

	const { enhance, form: formData, validateForm } = form;

	const handleFormInput = debounce(async () => {
		await validateForm({ update: false });
	}, 500);
</script>

<form
	method={POST}
	use:enhance
	class="my-5 flex flex-col items-center gap-5"
	on:input={handleFormInput}
>
	{#if message}
		<Alert.Root variant="destructive">
			<CircleAlert class="h-4 w-4" />

			<Alert.Title>Unable to register</Alert.Title>

			<Alert.Description>
				{message}
			</Alert.Description>
		</Alert.Root>
	{/if}

	<Form.Field {form} name="username" class="w-full">
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Username</Form.Label>
			<Input
				{...attrs}
				bind:value={$formData.username}
				placeholder="john_doe123"
				minlength={USERNAME_CONFIG.minUsernameLength}
				maxlength={USERNAME_CONFIG.maxUsernameLength}
				pattern={USERNAME_CONFIG.allowedCharacters.source}
			/>
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
			<Input {...attrs} bind:value={$formData.email} placeholder="john@example.com" type="email" />
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
