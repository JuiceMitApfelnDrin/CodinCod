<script lang="ts">
	import H1 from "@/components/typography/h1.svelte";

	let username = "Gorn10";
	let password = "password";
</script>

<form method="POST" class="m-5 flex flex-col items-center gap-5">
	<H1>Login and enjoy CodinCod!</H1>

	<div class="flex flex-col">
		<label class="sr-only" for="username">username</label>
		<input type="text" id="username" bind:value={username} placeholder="username" required />
	</div>
	<div class="flex flex-col">
		<label class="sr-only" for="password">password</label>
		<input type="password" id="password" bind:value={password} placeholder="password" required />
	</div>

	<button class="button" type="submit">login!</button>
</form>
