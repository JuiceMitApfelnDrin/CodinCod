<script lang="ts">
	import markdownIt from 'markdown-it';
	const md = markdownIt({ html: false, linkify: true,  });

	export let source: string = '';
</script>

<div>{@html md.render(source)}</div>
