<script lang="ts">
	import Clock from "@lucide/svelte/icons/clock";
	import CircleAlert from "@lucide/svelte/icons/circle-alert";
	import CircleCheck from "@lucide/svelte/icons/circle-check";
	import * as Alert from "./index";
	import { isHttpErrorCode } from "@/utils/is-http-error-code";
	import { httpResponseCodes } from "$lib/types";

	let {
		message,
		status,
		title
	}: {
		message: string;
		title: string;
		status: number;
	} = $props();

	const isRateLimited = $derived(
		status === httpResponseCodes.CLIENT_ERROR.TOO_MANY_REQUESTS
	);
</script>

<Alert.Root
	variant={isHttpErrorCode(status)
		? isRateLimited
			? "default"
			: "destructive"
		: "success"}
>
	{#if isRateLimited}
		<Clock class="h-4 w-4" />
	{:else if isHttpErrorCode(status)}
		<CircleAlert class="h-4 w-4" />
	{:else}
		<CircleCheck class="h-4 w-4" />
	{/if}

	<Alert.Title>
		{#if isRateLimited}
			Rate Limit Exceeded
		{:else}
			{title}{#if status !== httpResponseCodes.SUCCESSFUL.OK}{` - HTTP ${status}`}{/if}
		{/if}
	</Alert.Title>

	{#if isHttpErrorCode(status)}
		<Alert.Description>
			{message}
		</Alert.Description>
	{/if}
</Alert.Root>
