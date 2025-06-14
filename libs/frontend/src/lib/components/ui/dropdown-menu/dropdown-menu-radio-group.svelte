<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	let {
		value = $bindable(""),
		children,
		...rest
	}: {
		value?: DropdownMenuPrimitive.RadioGroupProps["value"];
		children?: Snippet;
		[key: string]: any;
	} = $props();
</script>

<DropdownMenuPrimitive.RadioGroup {...rest} bind:value>
	{@render children?.()}
</DropdownMenuPrimitive.RadioGroup>
