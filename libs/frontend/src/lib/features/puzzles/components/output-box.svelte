<script lang="ts">
	interface Props {
		title: string;
		children?: import('svelte').Snippet;
	}

	let { title, children }: Props = $props();
</script>

<p class="font-bold">{title}</p>
<div class="max-h-[20vh] w-full overflow-scroll rounded-lg border p-4 lg:max-w-full">
	<pre><code>{@render children?.()}</code></pre>
</div>

<style>
	pre {
		line-height: var(--code-block-line-height, normal);
	}
</style>
