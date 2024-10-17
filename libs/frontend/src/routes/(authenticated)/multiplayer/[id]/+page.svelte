<script lang="ts">
	import { page } from "$app/stores";
	import { buildWebSocketBackendUrl } from "@/config/backend";
	import { onMount } from "svelte";
	import { webSocketUrls } from "types";

	let socket: WebSocket;
	onMount(() => {
		const webSocketUrl = buildWebSocketBackendUrl(webSocketUrls.GAME);
		socket = new WebSocket(webSocketUrl);

		socket.addEventListener("open", (message) => {
			console.log("WebSocket connection opened");
		});

		socket.addEventListener("message", async (message) => {
			const data = JSON.parse(message.data);

			const { event } = data;

			console.log({ event, data });

			switch (event) {
				default:
					console.log("unknown / unhandled event: ", { event });

					break;
			}
		});
	});
</script>

<div>
	{$page.params.id}
</div>
