<script lang="ts">
	import { cn } from "@/utils/cn";

	

	interface Props {
		class?: string;
		children?: import('svelte').Snippet;
	}

	let { class = undefined, children }: Props = $props();
	
</script>

<h1 class={cn("scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl", className)}>
	{@render children?.()}
</h1>
