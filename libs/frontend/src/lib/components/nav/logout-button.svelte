<script lang="ts">
	import { goto } from "$app/navigation";
	import { searchParamKeys } from "@/config/search-params";
	import Button from "../ui/button/button.svelte";
	import { clearAuthenticatedUserInfo } from "@/stores";

	function logout() {
		clearAuthenticatedUserInfo();

		// Navigate to the current page with the ?logout query parameter
		goto(window.location.pathname + `?${searchParamKeys.LOGOUT}`);
	}
</script>

<Button on:click={logout}>Logout</Button>
