<script lang="ts">
	import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
	import type { Snippet } from "svelte";

	let {
		children,
		value = $bindable(""),
		...rest
	}: {
		value?: DropdownMenuPrimitive.RadioGroupProps["value"];
		children?: Snippet;
	} = $props();
</script>

<DropdownMenuPrimitive.RadioGroup {...rest} bind:value>
	{@render children?.()}
</DropdownMenuPrimitive.RadioGroup>
