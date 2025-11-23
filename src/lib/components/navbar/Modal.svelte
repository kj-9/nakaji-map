<script lang="ts">
	export let showModal: boolean = false;

	let dialog: HTMLDialogElement;

	$: if (dialog && showModal) {
		dialog.showModal();
	} else if (dialog) {
		dialog.close();
	}
</script>

<dialog
	bind:this={dialog}
	on:close={() => (showModal = false)}
	on:click|self={() => dialog.close()}
	class="rounded"
>
	<slot />
</dialog>

<style>
	@keyframes fade-in {
		0% {
			opacity: 0;
		}
		100% {
			opacity: 1;
		}
	}

	dialog[open] {
		/* Apply animation properties to the open dialog */
		opacity: 1;
		animation: fade-in 0.5s ease-in-out;
	}

	dialog[open]::backdrop {
		/* Apply animation properties to the open backdrop */
		opacity: 1;
		animation: fade-in 0.5s ease-in-out;
	}
</style>
