<script lang="ts">
	import { superForm, type SuperValidated } from "sveltekit-superforms";
	import * as Form from "$lib/components/ui/form";
	import { Input } from "@/components/ui/input";
	import {
		registerFormSchema,
		type RegisterForm
	} from "../config/register-form-schema";
	import { zod4Client } from "sveltekit-superforms/adapters";
	import { debounce } from "@/utils/debounce";
	import { PASSWORD_CONFIG, POST, USERNAME_CONFIG } from "types";
	import GenericAlert from "@/components/ui/alert/generic-alert.svelte";
	import { isHttpErrorCode } from "@/utils/is-http-error-code";
	import { testIds } from "@/config/test-ids";
	import { page } from "$app/state";
	import Button from "#/ui/button/button.svelte";
	import EyeClosed from "@lucide/svelte/icons/eye-closed";
	import Eye from "@lucide/svelte/icons/eye";

	let {
		data,
		message
	}: {
		data: SuperValidated<RegisterForm>;
		message: string | undefined;
	} = $props();

	const form = superForm(data.data, {
		validators: zod4Client(registerFormSchema)
	});

	const { enhance, form: formData, validateForm } = form;

	const handleFormInput = debounce(async () => {
		await validateForm({ update: false });
	}, 500);

	let showPassword = $state(false);
</script>

<form
	method={POST}
	use:enhance
	class="my-5 flex flex-col items-center gap-5"
	oninput={handleFormInput}
>
	<Form.Field {form} name="username" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-lg">Username</Form.Label>
				<Input
					{...props}
					bind:value={$formData.username}
					data-testid={testIds.REGISTER_FORM_INPUT_USERNAME}
					placeholder="john_doe123"
					minlength={USERNAME_CONFIG.minUsernameLength}
					maxlength={USERNAME_CONFIG.maxUsernameLength}
					pattern={USERNAME_CONFIG.allowedCharacters.source}
				/>
			{/snippet}
		</Form.Control>
		<Form.Description
			>Username must be {USERNAME_CONFIG.minUsernameLength}-{USERNAME_CONFIG.maxUsernameLength}
			characters long and can include letters, numbers, hyphens, and underscores.</Form.Description
		>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="email" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-lg">Email</Form.Label>
				<Input
					{...props}
					data-testid={testIds.REGISTER_FORM_INPUT_EMAIL}
					bind:value={$formData.email}
					placeholder="john@example.com"
					type="email"
				/>
			{/snippet}
		</Form.Control>
		<Form.Description>Email must be a valid email address.</Form.Description>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="password" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-lg">Password</Form.Label>
				<Input
					type="password"
					{...props}
					data-testid={testIds.REGISTER_FORM_INPUT_PASSWORD}
					bind:value={$formData.password}
					placeholder={`${PASSWORD_CONFIG.minPasswordLength}characters`}
				/>
				<Button
					onclick={() => (showPassword = !showPassword)}
					data-testid={testIds.REGISTER_FORM_BUTTON_TOGGLE_SHOW_PASSWORD}
				>
					{#if showPassword}
						<EyeClosed /> Hide password
					{:else}
						<Eye /> Show password
					{/if}
				</Button>
			{/snippet}
		</Form.Control>

		<Form.Description
			>Password must be at least {PASSWORD_CONFIG.minPasswordLength} characters.
			<span class="text-xs"
				>(If you are interested to
				<a
					class="underline"
					href="https://bitwarden.com/blog/how-long-should-my-password-be/"
					target="_blank">know why</a
				>.)</span
			></Form.Description
		>
		<Form.FieldErrors />
	</Form.Field>

	{#if message}
		<GenericAlert
			title={isHttpErrorCode(page.status)
				? "Unable to register"
				: "Registration successful"}
			status={page.status}
			{message}
		/>
	{/if}

	<Form.Button data-testid={testIds.REGISTER_FORM_BUTTON_REGISTER}
		>Register</Form.Button
	>
</form>
