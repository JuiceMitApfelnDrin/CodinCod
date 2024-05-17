<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';
	import { cn } from '@/utils/cn';

	type $$Props = HTMLInputAttributes;

	let className: $$Props['class'] = undefined;
	export { className as class };
</script>

<div
	class={cn('container mx-auto flex flex-col', className)}
>
	<slot></slot>
</div>
