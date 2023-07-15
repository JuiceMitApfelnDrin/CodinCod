<script>
	import { Card } from 'flowbite-svelte';
	export let cardClass = '';
</script>

<Card
	class="bg-primary-400 dark:bg-primary-800 dark:border-primary-200 border-primary-700 {cardClass}"
>
	<slot />
</Card>
