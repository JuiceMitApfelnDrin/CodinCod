<script lang="ts">
	import { CircleAlert, CircleCheck, Clock } from "@lucide/svelte";
	import * as Alert from "./index";
	import { isHttpErrorCode } from "@/utils/is-http-error-code";
	import { httpResponseCodes } from "types";

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
