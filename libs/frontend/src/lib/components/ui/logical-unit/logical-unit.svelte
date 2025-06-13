<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";

	type $$Props = HTMLInputAttributes;

	interface Props {
		class?: $$Props["class"];
		children?: import("svelte").Snippet;
	}

	let { class: className = undefined, children }: Props = $props();
</script>

<!-- important: should never have any classes defined by itself! -->
<div class={className}>
	{@render children?.()}
</div>
