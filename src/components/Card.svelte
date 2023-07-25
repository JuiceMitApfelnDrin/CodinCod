<script>
	import { Card } from 'flowbite-svelte';
	export let cardClass = '';
</script>

<Card
	class="dark:text-primary-100 dark:bg-black dark:border-primary-500 border-primary-700 {cardClass}"
>
	<slot />
</Card>
