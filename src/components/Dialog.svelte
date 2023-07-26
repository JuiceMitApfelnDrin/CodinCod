<script lang="ts">
	let dialog: HTMLDialogElement;

	export let text: string = 'login';
</script>

<dialog bind:this={dialog}>
	<form method="dialog">
		<slot />
	</form>
</dialog>

<button on:click={() => dialog.showModal()}>{text}</button>
