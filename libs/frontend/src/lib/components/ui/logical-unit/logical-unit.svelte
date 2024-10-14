<script lang="ts">
	import type { HTMLInputAttributes } from "svelte/elements";

	type $$Props = HTMLInputAttributes;

	let className: $$Props["class"] = undefined;
	export { className as class };
</script>

<!-- important: should never have any classes defined by itself! -->
<div class={className}>
	<slot />
</div>
