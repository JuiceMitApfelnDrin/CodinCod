<script lang="ts">
	import type { Label as LabelPrimitive } from "bits-ui";
	import { getFormControl } from "formsnap";
	import { cn } from "@/utils/cn";
	import { Label } from "$lib/components/ui/label/index.js";

	type $$Props = LabelPrimitive.Props;

	interface Props {
		class?: $$Props["class"];
		children?: import("svelte").Snippet<[any]>;
		[key: string]: any;
	}

	let { class: className = undefined, children, ...rest }: Props = $props();

	const { labelAttrs } = getFormControl();
</script>

<Label
	{...$labelAttrs}
	class={cn("data-[fs-error]:text-destructive data-[fs-error]:dark:text-red-500", className)}
	{...rest}
>
	{@render children?.({ labelAttrs })}
</Label>
