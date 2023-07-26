<script lang="ts">
	import { backend_urls, generateBackendUrl } from '$config/backend';
	import axios from 'axios';
	console.log(generateBackendUrl(backend_urls.login));

	async function login() {
		const loginInfo = {
			nickname: username,
			password
		};

		return axios
			.post(generateBackendUrl(backend_urls.login), JSON.stringify(loginInfo))
			.then((res) => {
				console.log(res);
			})
			.catch((ding) => {
				// TODO: show error to user => login failed retry!?
				console.log(ding);
			});
	}

	let username = 'Gorn10';
	let password = 'password';
</script>

<h1>hi there, you can login here to your favorite site!</h1>

<form>
	<div class="flex flex-col">
		<label class="sr-only" for="username">username</label>
		<input id="username" bind:value={username} placeholder="username" required />
	</div>
	<div class="flex flex-col">
		<label class="sr-only" for="password">password</label>
		<input type="password" id="password" bind:value={password} placeholder="password" required />
	</div>

	<button class="button" type="submit" on:click={login}>login!</button>
</form>
