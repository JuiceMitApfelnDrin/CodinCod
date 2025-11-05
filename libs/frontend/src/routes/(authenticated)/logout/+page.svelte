<script lang="ts">
	import { enhance } from "$app/forms";
	import { invalidateAll } from "$app/navigation";
	import { authenticatedUserInfo } from "@/stores/auth.store";
	import { onMount } from "svelte";

	let formElement: HTMLFormElement;

	// Clear the store and submit the logout form immediately
	onMount(async () => {
		authenticatedUserInfo.set(null);
		await invalidateAll();
		formElement?.requestSubmit();
	});
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="text-center">
		<h1 class="mb-4 text-2xl font-bold">Logging out...</h1>
		<form
			method="POST"
			use:enhance={() => {
				return async ({ update }) => {
					await invalidateAll();
					await update();
				};
			}}
			bind:this={formElement}
		>
			<!-- Form auto-submits on mount -->
		</form>
	</div>
</div>
