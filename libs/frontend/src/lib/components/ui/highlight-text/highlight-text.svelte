<script lang="ts">
	interface Props {
		text: string;
	}

	let { text }: Props = $props();
</script>

<em><span class="text-teal-700 dark:text-teal-200">{text}</span></em>
