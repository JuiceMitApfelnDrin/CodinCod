<script lang="ts">
	import type { WebSocketManager } from "@/websocket/websocket-manager.svelte";
	import {
		WEBSOCKET_STATES,
		type WebSocketState
	} from "@/websocket/websocket-constants";
	import { testIds } from "types";

	let {
		wsManager,
		state,
		class: className = "",
		showLabel = false
	}: {
		wsManager: WebSocketManager;
		state: WebSocketState;
		class?: string;
		showLabel?: boolean;
	} = $props();

	const statusConfig = $derived.by(() => {
		const isOnline = wsManager.isNetworkOnline();

		switch (state) {
			case WEBSOCKET_STATES.CONNECTED:
				return {
					color: "bg-green-500",
					text: "Connected",
					pulse: false,
					icon: "●",
					canReconnect: false,
					tooltip: "Connected to server"
				};
			case WEBSOCKET_STATES.CONNECTING:
				return {
					color: "bg-yellow-500",
					text: "Connecting...",
					pulse: true,
					icon: "●",
					canReconnect: false,
					tooltip: "Connecting to server..."
				};
			case WEBSOCKET_STATES.RECONNECTING:
				return {
					color: "bg-orange-500",
					text: "Reconnecting...",
					pulse: true,
					icon: "●",
					canReconnect: true,
					tooltip: "Reconnecting... Click to retry now"
				};
			case WEBSOCKET_STATES.DISCONNECTED:
				return {
					color: isOnline ? "bg-gray-500" : "bg-gray-400",
					text: isOnline ? "Disconnected" : "No Internet",
					pulse: false,
					icon: "○",
					canReconnect: isOnline,
					tooltip: isOnline
						? "Click to reconnect"
						: "No internet connection detected"
				};
			case WEBSOCKET_STATES.ERROR:
				return {
					color: "bg-red-500",
					text: "Connection Error",
					pulse: false,
					icon: "✕",
					canReconnect: isOnline,
					tooltip: isOnline
						? "Error - Click to retry"
						: "Error - No internet connection"
				};
			default:
				return {
					color: "bg-gray-500",
					text: "Unknown",
					pulse: false,
					icon: "?",
					canReconnect: false,
					tooltip: "Unknown connection state"
				};
		}
	});

	function handleClick() {
		if (statusConfig.canReconnect) {
			wsManager.reconnect();
		}
	}
</script>

<button
	onclick={handleClick}
	disabled={!statusConfig.canReconnect}
	title={statusConfig.tooltip}
	data-testid={testIds.GAME_COMPONENT_CONNECTION_STATUS}
	class="flex items-center gap-2 text-sm motion-safe:transition-opacity {className} {statusConfig.canReconnect
		? 'cursor-pointer hover:opacity-80'
		: 'cursor-default'}"
	aria-label={statusConfig.tooltip}
>
	<span class="relative flex h-3 w-3">
		{#if statusConfig.pulse}
			<span
				class="absolute inline-flex h-full w-full rounded-full motion-safe:animate-ping {statusConfig.color} opacity-75"
			></span>
		{/if}
		<span class="relative inline-flex h-3 w-3 rounded-full {statusConfig.color}"
		></span>
	</span>
	{#if showLabel}
		<span class="text-muted-foreground">{statusConfig.text}</span>
	{/if}
</button>
