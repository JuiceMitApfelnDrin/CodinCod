<script lang="ts">
	import { page } from "$app/state";
	import H1 from "@/components/typography/h1.svelte";
	import P from "@/components/typography/p.svelte";
	import Button from "@/components/ui/button/button.svelte";
	import Container from "@/components/ui/container/container.svelte";
	import { testIds, frontendUrls } from "$lib/types";
	import AlertCircle from "@lucide/svelte/icons/alert-circle";
	import Home from "@lucide/svelte/icons/home";
	import RefreshCw from "@lucide/svelte/icons/refresh-cw";
	import LogIn from "@lucide/svelte/icons/log-in";

	// Log error for monitoring
	$effect(() => {
		if (page.error) {
			console.error("Authenticated route error:", {
				message: page.error.message,
				status: page.status,
				path: page.url.pathname
			});
		}
	});

	function reload() {
		window.location.reload();
	}

	// Check if error is authentication-related
	const isAuthError = $derived(page.status === 401 || page.status === 403);
</script>

<svelte:head>
	<title>Error - CodinCod</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<Container class="flex min-h-[80vh] items-center justify-center">
	<div class="w-full max-w-md space-y-8 text-center">
		<div class="space-y-4">
			<div class="flex justify-center">
				<div class="bg-destructive/10 rounded-full p-6" aria-hidden="true">
					<AlertCircle class="text-destructive h-16 w-16" />
				</div>
			</div>

			<div class="space-y-2">
				<H1>
					{#if isAuthError}
						Authentication Required
					{:else if page.status === 404}
						Page Not Found
					{:else}
						Something Went Wrong
					{/if}
				</H1>

				<P class="text-muted-foreground">
					{#if isAuthError}
						Your session has expired or you don't have permission to access this
						page. Please log in again.
					{:else if page.status === 404}
						The page you're looking for doesn't exist or has been moved.
					{:else if page.status >= 500}
						We're experiencing technical difficulties. Please try again later.
					{:else}
						{page.error?.message || "An unexpected error occurred."}
					{/if}
				</P>

				{#if !isAuthError}
					<P class="text-muted-foreground text-sm">
						Error code: {page.status}
					</P>
				{/if}
			</div>
		</div>

		<div class="flex flex-col gap-3 sm:flex-row sm:justify-center">
			{#if isAuthError}
				<Button
					variant="default"
					href={frontendUrls.LOGIN}
					data-testid={testIds.NAVIGATION_ANCHOR_LOGIN}
				>
					<LogIn class="mr-2 h-4 w-4" />
					Log In
				</Button>
			{:else}
				<Button
					variant="default"
					href={frontendUrls.ROOT}
					data-testid={testIds.ERROR_COMPONENT_ANCHOR_HOMEPAGE}
				>
					<Home class="mr-2 h-4 w-4" />
					Go Home
				</Button>
			{/if}

			{#if !isAuthError && page.status !== 404}
				<Button
					variant="outline"
					onclick={reload}
					data-testid={testIds.ERROR_COMPONENT_BUTTON_RELOAD}
				>
					<RefreshCw class="mr-2 h-4 w-4" />
					Try Again
				</Button>
			{/if}
		</div>

		{#if import.meta.env.DEV && page.error}
			<details class="mt-8 text-left">
				<summary
					class="text-muted-foreground hover:text-foreground cursor-pointer text-sm"
				>
					Debug Information (Dev Only)
				</summary>
				<pre
					class="bg-muted mt-2 overflow-auto rounded-lg p-4 text-left text-xs">{JSON.stringify(
						{
							message: page.error.message,
							status: page.status,
							path: page.url.pathname,
							stack: (page.error as Error & { stack?: string }).stack
						},
						null,
						2
					)}</pre>
			</details>
		{/if}
	</div>
</Container>
