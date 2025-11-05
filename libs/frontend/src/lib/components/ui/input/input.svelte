<script lang="ts">
	import type {
		HTMLInputAttributes,
		HTMLInputTypeAttribute
	} from "svelte/elements";
	import type { WithElementRef } from "bits-ui";
	import { cn } from "@/utils/cn";
	import type { DataTestIdProp } from "$lib/types";

	type InputType = Exclude<HTMLInputTypeAttribute, "file">;

	type Props = WithElementRef<
		Omit<HTMLInputAttributes, "type" | "data-testid"> &
			Partial<DataTestIdProp> &
			(
				| { type: "file"; files?: FileList }
				| { type?: InputType; files?: undefined }
			)
	>;

	let {
		class: className,
		"data-testid": testId,
		files = $bindable(),
		ref = $bindable(null),
		type,
		value = $bindable(),
		...restProps
	}: Props = $props();
</script>

{#if type === "file"}
	<input
		bind:this={ref}
		class={cn(
			"border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
			className
		)}
		type="file"
		data-testid={testId}
		bind:files
		bind:value
		{...restProps}
	/>
{:else}
	<input
		bind:this={ref}
		class={cn(
			"border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-base file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
			className
		)}
		{type}
		data-testid={testId}
		bind:value
		{...restProps}
	/>
{/if}
