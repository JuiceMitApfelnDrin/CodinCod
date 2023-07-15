<script lang="ts">
	import { urls } from '$config/routes';
	import { Button, NavLi } from 'flowbite-svelte';

	let hi = 'wassup';
</script>

<div class="mx-auto container">
	<a href={urls.puzzle}>Puzzle</a>
	hi there, {hi}
</div>
