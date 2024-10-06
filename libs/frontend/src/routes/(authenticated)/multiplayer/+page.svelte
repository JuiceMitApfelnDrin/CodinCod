<script lang="ts">
	import { authenticatedUserInfo } from "@/stores";
	import { onMount } from "svelte";

	let socket: WebSocket;
	onMount(() => {
		socket = new WebSocket("ws://localhost:8888/");

		socket.addEventListener("open", (message) => {
			console.log("WebSocket connection opened");
			socket.send(JSON.stringify({ something: "different" }));
			console.log(message);
		});

		socket.addEventListener("message", (message) => {
			console.log(message.data);
		});
	});
</script>

<div>waiting room</div>

<button
	on:click={() => {
		socket.send(
			JSON.stringify({ event: "join:room", roomId: 1, username: $authenticatedUserInfo?.username })
		);
	}}
>
	join room 1
</button>

<button
	on:click={() => {
		socket.send(
			JSON.stringify({ event: "leave:room", roomId: 1, username: $authenticatedUserInfo?.username })
		);
	}}
>
	leave room 1
</button>
