<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";

	import { cn } from "@/utils/cn";

	type $$Props = HTMLAttributes<HTMLTableSectionElement>;

	interface Props {
		class?: $$Props["class"];
		children?: import('svelte').Snippet;
		[key: string]: any
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
	
</script>

<tfoot class={cn("bg-muted/50 font-medium text-primary-foreground", className)} {...rest}>
	{@render children?.()}
</tfoot>
