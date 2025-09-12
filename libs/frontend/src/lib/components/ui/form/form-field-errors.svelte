<script lang="ts">
	import * as FormPrimitive from "formsnap";
	import type { WithoutChild } from "bits-ui";
	import { cn } from "@/utils/cn";

	let {
		children: childrenProp,
		class: className,
		errorClasses,
		ref = $bindable(null),
		...restProps
	}: WithoutChild<FormPrimitive.FieldErrorsProps> & {
		errorClasses?: string | undefined | null;
	} = $props();
</script>

<FormPrimitive.FieldErrors
	bind:ref
	class={cn("text-destructive text-sm font-medium", className)}
	{...restProps}
>
	{#snippet children({ errorProps, errors })}
		{#if childrenProp}
			{@render childrenProp({ errorProps, errors })}
		{:else}
			{#each errors as error (error)}
				<div {...errorProps} class={cn(errorClasses)}>{error}</div>
			{/each}
		{/if}
	{/snippet}
</FormPrimitive.FieldErrors>
