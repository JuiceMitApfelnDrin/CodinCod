<script lang="ts">
	import { enhance } from "$app/forms";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import {
		Alert,
		AlertDescription,
		AlertTitle
	} from "$lib/components/ui/alert";
	import Mail from "@lucide/svelte/icons/mail";
	import ArrowLeft from "@lucide/svelte/icons/arrow-left";
	import Button from "#/ui/button/button.svelte";
	import { frontendUrls } from "@codincod/shared/constants/frontend-urls";
	import { testIds } from "@codincod/shared/constants/test-ids";

	let { data, form } = $props();

	let submitting = $state(false);
	let email = $state("");
</script>

<svelte:head>
	<title>Forgot Password | CodinCod</title>
</svelte:head>

<div
	class="container flex h-screen w-screen flex-col items-center justify-center"
>
	<a
		href={frontendUrls.LOGIN}
		class="hover:bg-accent hover:text-accent-foreground absolute top-4 left-4 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors md:top-8 md:left-8"
		data-testid={testIds.FORGOT_PASSWORD_PAGE_BUTTON_BACK_TO_LOGIN}
	>
		<ArrowLeft class="mr-2 h-4 w-4" />
		Back to login
	</a>
	<div
		class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]"
	>
		<div class="flex flex-col space-y-2 text-center">
			<Mail class="mx-auto h-12 w-12" />
			<h1 class="text-2xl font-semibold tracking-tight">Reset your password</h1>
			<p class="text-muted-foreground text-sm">
				Enter your email and we'll send you a password reset link
			</p>
		</div>

		{#if form?.success}
			<Alert>
				<Mail class="h-4 w-4" />
				<AlertTitle>Check your email</AlertTitle>
				<AlertDescription>
					If an account exists with this email, a password reset link has been
					sent.
				</AlertDescription>
			</Alert>
		{:else}
			<form
				method="POST"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update();
						submitting = false;
					};
				}}
			>
				<div class="grid gap-4">
					{#if form?.error}
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{form.error}</AlertDescription>
						</Alert>
					{/if}

					<div class="grid gap-2">
						<Label for="email">Email</Label>
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="name@example.com"
							bind:value={email}
							required
							disabled={submitting}
							autocomplete="email"
						/>
						{#if form?.errors?.email}
							<p class="text-destructive text-sm">{form.errors.email}</p>
						{/if}
					</div>

					<Button
						type="submit"
						disabled={submitting}
						class="w-full"
						data-testid={testIds.FORGOT_PASSWORD_PAGE_BUTTON_SUBMIT}
					>
						{submitting ? "Sending..." : "Send reset link"}
					</Button>
				</div>
			</form>

			<p class="text-muted-foreground px-8 text-center text-sm">
				Remember your password?
				<a
					href={frontendUrls.LOGIN}
					class="hover:text-primary underline underline-offset-4"
				>
					Sign in
				</a>
			</p>
		{/if}
	</div>
</div>
