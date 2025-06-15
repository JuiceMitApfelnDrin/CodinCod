<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { type Variant, alertVariants } from "./index.js";
	import { cn } from "@/utils/cn.js";
	import type { Snippet } from "svelte";

	type $$Props = HTMLAttributes<HTMLDivElement> & {
		variant?: Variant;
	};

	let {
		class: className = undefined,
		variant = "default",
		children,
		...rest
	}: {
		class?: $$Props["class"];
		variant?: $$Props["variant"];
		children?: Snippet;
		[key: string]: any;
	} = $props();
</script>

<div class={cn(alertVariants({ variant }), className)} {...rest} role="alert">
	{@render children?.()}
</div>
