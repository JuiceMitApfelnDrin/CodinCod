<script lang="ts">
	import { superForm, type SuperValidated } from "sveltekit-superforms";
	import * as Form from "$lib/components/ui/form";
	import { Input } from "@/components/ui/input";
	import { zodClient } from "sveltekit-superforms/adapters";
	import { debounce } from "@/utils/debounce";
	import { type Login, loginSchema, PASSWORD_CONFIG, POST, USERNAME_CONFIG } from "types";
	import * as Alert from "$lib/components/ui/alert";
	import { CircleAlert } from "lucide-svelte";

	export let data: SuperValidated<Login>;
	export let message: string = "";

	const form = superForm(data.data, {
		validators: zodClient(loginSchema)
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

			<Alert.Title>Unable to login</Alert.Title>

			<Alert.Description>
				{message}
			</Alert.Description>
		</Alert.Root>
	{/if}

	<Form.Field {form} name="identifier" class="w-full">
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Username or email</Form.Label>
			<Input
				{...attrs}
				bind:value={$formData.identifier}
				minlength={USERNAME_CONFIG.minUsernameLength}
				maxlength={USERNAME_CONFIG.maxUsernameLength}
				pattern={USERNAME_CONFIG.allowedCharacters.source}
			/>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Field {form} name="password" class="w-full">
		<Form.Control let:attrs>
			<Form.Label class="text-lg">Password</Form.Label>
			<Input
				type="password"
				{...attrs}
				bind:value={$formData.password}
				minlength={PASSWORD_CONFIG.minPasswordLength}
			/>
		</Form.Control>
		<Form.FieldErrors />
	</Form.Field>

	<Form.Button>Login</Form.Button>
</form>
