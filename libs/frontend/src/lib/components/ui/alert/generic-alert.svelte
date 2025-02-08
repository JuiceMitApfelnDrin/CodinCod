<script lang="ts">
	import { CircleAlert, CircleCheck } from "lucide-svelte";
	import * as Alert from "./index";
	import { isHttpErrorCode } from "@/utils/is-http-error-code";
	import { httpResponseCodes } from "types";

	export let message: string;

	export let title: string;
	export let status: number;
</script>

<Alert.Root variant={isHttpErrorCode(status) ? "destructive" : "success"}>
	{#if isHttpErrorCode(status)}
		<CircleAlert class="h-4 w-4" />
	{:else}
		<CircleCheck class="h-4 w-4" />
	{/if}

	<Alert.Title>
		{title}{#if status !== httpResponseCodes.SUCCESSFUL.OK}{` - HTTP ${status}`}{/if}
	</Alert.Title>

	{#if isHttpErrorCode(status)}
		<Alert.Description>
			{message}
		</Alert.Description>
	{/if}
</Alert.Root>
