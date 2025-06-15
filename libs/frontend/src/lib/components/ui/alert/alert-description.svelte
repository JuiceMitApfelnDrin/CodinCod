<script lang="ts">
	import { cn } from "@/utils/cn";
	import type { Snippet } from "svelte";
	import type { HTMLAttributes } from "svelte/elements";

	type $$Props = HTMLAttributes<HTMLDivElement>;

	interface Props {
		class?: $$Props["class"];
		children?: Snippet;
		[key: string]: any;
	}

	let { class: className = undefined, children, ...rest }: Props = $props();
</script>

<div class={cn("text-sm [&_p]:leading-relaxed", className)} {...rest}>
	{@render children?.()}
</div>
