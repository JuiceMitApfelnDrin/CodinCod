<script lang="ts">
	import { cn } from "@/utils/cn";

	

	interface Props {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { class = undefined, children }: Props = $props();
	
</script>

<p class={cn("leading-7 [&:not(:first-child)]:mt-2 lg:[&:not(:first-child)]:mt-4", className)}>
	{@render children?.()}
</p>
