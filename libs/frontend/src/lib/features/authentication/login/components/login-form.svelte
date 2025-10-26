<script lang="ts">
	import { superForm, type SuperValidated } from "sveltekit-superforms";
	import * as Form from "$lib/components/ui/form";
	import { Input } from "@/components/ui/input";
	import { zod4Client } from "sveltekit-superforms/adapters";
	import { debounce } from "@/utils/debounce";
	import {
		loginSchema,
		PASSWORD_CONFIG,
		POST,
		IDENTIFIER_CONFIG,
		type Login
	} from "types";
	import GenericAlert from "@/components/ui/alert/generic-alert.svelte";
	import { isHttpErrorCode } from "@/utils/is-http-error-code";
	import { page } from "$app/stores";
	import { testIds } from "@/config/test-ids";

	let {
		data,
		message
	}: {
		data: SuperValidated<Login>;
		message: string | undefined;
	} = $props();

	const form = superForm(data, {
		validators: zod4Client(loginSchema)
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
	oninput={handleFormInput}
>
	<Form.Field {form} name="identifier" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-lg">Username or email</Form.Label>
				<Input
					{...props}
					data-testid={testIds.LOGIN_FORM_INPUT_IDENTIFIER}
					bind:value={$formData.identifier}
					minlength={IDENTIFIER_CONFIG.minIdentifierLength}
					maxlength={IDENTIFIER_CONFIG.maxIdentifierLength}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="password" class="w-full">
		<Form.Control>
			{#snippet children({ props })}
				<Form.Label class="text-lg">Password</Form.Label>
				<Input
					type="password"
					{...props}
					data-testid={testIds.LOGIN_FORM_INPUT_PASSWORD}
					bind:value={$formData.password}
					minlength={PASSWORD_CONFIG.minPasswordLength}
				/>
			{/snippet}
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	{#if message}
		<GenericAlert
			title={isHttpErrorCode($page.status)
				? "Unable to log-in"
				: "Login successful"}
			status={$page.status}
			{message}
		/>
	{/if}

	<Form.Button data-testid={testIds.LOGIN_FORM_BUTTON_LOGIN}>Login</Form.Button>
</form>
