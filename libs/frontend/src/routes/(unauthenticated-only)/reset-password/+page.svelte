<script lang="ts">
	import { enhance } from "$app/forms";
	import { page } from "$app/stores";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import {
		Alert,
		AlertDescription,
		AlertTitle
	} from "$lib/components/ui/alert";
	import KeyRound from "@lucide/svelte/icons/key-round";
	import CheckCircle2 from "@lucide/svelte/icons/check-circle-2";
	import Button from "#/ui/button/button.svelte";
	import { frontendUrls, testIds } from "types";

	let { form } = $props();

	let submitting = $state(false);
	let password = $state("");
	let confirmPassword = $state("");

	const email = $page.url.searchParams.get("email");
	const confirmationCode = $page.url.searchParams.get("confirmationCode");
	const token = confirmationCode; // Token is the confirmation code from URL
</script>

<svelte:head>
	<title>Reset Password | CodinCod</title>
</svelte:head>

<div
	class="container flex h-screen w-screen flex-col items-center justify-center"
>
	<div
		class="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]"
	>
		<div class="flex flex-col space-y-2 text-center">
			{#if form?.success}
				<CheckCircle2 class="mx-auto h-12 w-12 text-green-600" />
				<h1 class="text-2xl font-semibold tracking-tight">
					Password reset successful
				</h1>
				<p class="text-muted-foreground text-sm">
					Your password has been updated
				</p>
			{:else}
				<KeyRound class="mx-auto h-12 w-12" />
				<h1 class="text-2xl font-semibold tracking-tight">Set new password</h1>
				<p class="text-muted-foreground text-sm">
					Choose a strong password for your account
				</p>
			{/if}
		</div>

		{#if form?.success}
			<div class="space-y-4">
				<Alert>
					<CheckCircle2 class="h-4 w-4" />
					<AlertTitle>Success</AlertTitle>
					<AlertDescription>
						You can now log in with your new password.
					</AlertDescription>
				</Alert>

				<Button
					href={frontendUrls.LOGIN}
					class="w-full"
					data-testid={testIds.RESET_PASSWORD_PAGE_BUTTON_CONTINUE_TO_LOGIN}
				>
					Continue to login
				</Button>
			</div>
		{:else if !token}
			<Alert variant="destructive">
				<AlertTitle>Invalid link</AlertTitle>
				<AlertDescription>
					This password reset link is invalid or has expired.
					<a href={frontendUrls.FORGOT_PASSWORD} class="underline"
						>Request a new one</a
					>
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
				<input type="hidden" name="token" value={token} />

				<div class="grid gap-4">
					{#if form?.error}
						<Alert variant="destructive">
							<AlertTitle>Error</AlertTitle>
							<AlertDescription>{form.error}</AlertDescription>
						</Alert>
					{/if}

					<div class="grid gap-2">
						<Label for="password">New Password</Label>
						<Input
							id="password"
							name="password"
							type="password"
							placeholder="••••••••"
							bind:value={password}
							required
							disabled={submitting}
							autocomplete="new-password"
						/>
						{#if form?.errors?.password}
							<p class="text-destructive text-sm">{form.errors.password}</p>
						{/if}
					</div>

					<div class="grid gap-2">
						<Label for="confirmPassword">Confirm Password</Label>
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							placeholder="••••••••"
							bind:value={confirmPassword}
							required
							disabled={submitting}
							autocomplete="new-password"
						/>
						{#if password && confirmPassword && password !== confirmPassword}
							<p class="text-destructive text-sm">Passwords do not match</p>
						{/if}
					</div>

					<Button
						type="submit"
						disabled={submitting ||
							password !== confirmPassword ||
							password.length < 8}
						class="w-full"
						data-testid={testIds.RESET_PASSWORD_PAGE_BUTTON_SUBMIT}
					>
						{submitting ? "Resetting..." : "Reset password"}
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
