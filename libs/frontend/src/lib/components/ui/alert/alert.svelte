<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { type Variant, alertVariants } from "./index.js";
	import { cn } from "@/utils/cn.js";
	import type { Snippet } from "svelte";

	type $$Props = HTMLAttributes<HTMLDivElement> & {
		variant?: Variant;
	};

	let {
		children,
		class: className = undefined,
		variant = "default",
		...rest
	}: {
		class?: $$Props["class"];
		variant?: $$Props["variant"];
		children?: Snippet;
	} = $props();
</script>

<div class={cn(alertVariants({ variant }), className)} {...rest} role="alert">
	{@render children?.()}
</div>
