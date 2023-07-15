<script lang="ts">
	import MonacoEditor from '$components/MonacoEditor.svelte';
	import { Heading } from 'flowbite-svelte';
	import SvelteMarkdown from 'svelte-markdown';

	const src = `
This is a description paragraph.

* This is a list
* With two items
  1. And a sublist
  2. That is ordered
    - With another
    - Sublist inside
	3. xdd

| And this is | A table |
|-------------|---------|
| With two    | columns |`;
</script>

<div class="flex flex-col container m-auto gap-4 pt-5">
	<h1>Title of puzzle</h1>
	<SvelteMarkdown source={src} />
	<MonacoEditor />
</div>
