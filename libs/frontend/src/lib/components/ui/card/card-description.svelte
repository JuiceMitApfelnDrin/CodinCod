<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import { cn } from "@/utils/cn";

	type $$Props = HTMLAttributes<HTMLParagraphElement>;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<p class={cn("text-sm text-muted-foreground", className)} {...$$restProps}>
	<slot />
</p>
