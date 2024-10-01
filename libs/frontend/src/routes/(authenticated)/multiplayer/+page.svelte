<script lang="ts">
	import { onMount } from "svelte";

	let socket: WebSocket;
	onMount(() => {
		socket = new WebSocket("ws://localhost:8888/");

		socket.addEventListener("open", (message) => {
			console.log("WebSocket connection opened");
			socket.send("bruh, these tiddies be smacking");
			console.log(message);
		});

		socket.addEventListener("message", (message) => {
			console.log(message.data);
			console.log("Opened");
		});
	});
</script>
