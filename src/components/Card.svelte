<script lang="ts">
	import { Card } from 'flowbite-svelte';
	import type { SizeType } from 'flowbite-svelte/dist/types';
	export let cardClass: string = '';
	export let size: SizeType = 'sm';
</script>

<Card
	class="dark:text-primary-100 dark:bg-black dark:border-primary-500 border-primary-700 flex gap-5 {cardClass}"
	{size}
>
	<slot />
</Card>
