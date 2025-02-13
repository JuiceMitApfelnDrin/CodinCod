<script lang="ts">
	export let title: string;
</script>

<h4 class="font-bold">{title}</h4>
<div class="max-h-[20vh] w-full overflow-scroll rounded-lg border p-4 lg:max-w-full">
	<pre><code><slot /></code></pre>
</div>

<style>
	pre {
		line-height: var(--code-block-line-height, normal);
	}
</style>
