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

<form on:submit={login} class="flex flex-col items-center gap-5 m-5">
	<h1>Login and enjoy CodinCod!</h1>

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
