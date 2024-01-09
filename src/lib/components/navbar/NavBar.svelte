<script lang="ts">
	import About from '$lib/components/navbar/content/About.svelte';
	import News from '$lib/components/navbar/content/News.svelte';
	import { onMount } from 'svelte';

	let dialog: HTMLDialogElement;

	// type for NavBarItems
	type NavBarItems = {
		About: typeof About;
		News: typeof News;
	};

	const navBarItems: NavBarItems = {
		About,
		News
	};

	// workaround for typing string[] as keysof NavBarItems
	const getItemsKeys = () => {
		return Object.keys(navBarItems) as (keyof NavBarItems)[];
	};
	// Track the selected navigation item
	let selectedNavItem: keyof NavBarItems | null = null;

	// handle nav bar item click
	// item is keys of NavBarItems
	function handleNavItemClick(itemKey: keyof NavBarItems) {
		// already selected
		if (selectedNavItem == itemKey) {
			dialog.close();
			selectedNavItem = null;
			return;
		}

		// select new item
		selectedNavItem = itemKey;
		dialog.showModal();
	}

	function handleNavItemClose() {
		selectedNavItem = null;
		dialog.close();
		console.log('close');
	}

	// show 'about' from start
	onMount(() => {
		// close dialog when click outside
		dialog.addEventListener('click', (e) => {
			const element = e.target as HTMLElement;
			if (element.id === dialog.id) {
				handleNavItemClose();
			}
		});
		handleNavItemClick('About');
	});
</script>

<dialog bind:this={dialog} id="mega-menu-full-dropdown" class="rounded">
	<div class="bg-gray-50 max-w-xs sm:max-w-2xl px-4 py-5 text-gray-900">
		<form class="absolute top-0 right-0 mt-4 mr-4" method="dialog">
			<button
				type="submit"
				on:click|stopPropagation={handleNavItemClose}
				class="bg-white rounded-md inline-flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
			>
				<span class="sr-only">Close menu</span>
				<!-- Heroicon name: outline/x -->
				<svg
					class="h-6 w-6"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					aria-hidden="true"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						stroke-width="2"
						d="M6 18L18 6M6 6l12 12"
					/>
				</svg>
			</button>
		</form>
		{#if selectedNavItem != null}
			<svelte:component this={navBarItems[selectedNavItem]} />
		{/if}
	</div>
</dialog>

<nav>
	<div class="flex flex-wrap justify-between items-center">
		<div id="mega-menu-full" class="items-center justify-between font-medium">
			<ul class="flex space-x-8 flex-row">
				{#each getItemsKeys() as itemKey}
					<li class="{selectedNavItem == itemKey ? 'bg-gray-50' : ''}  rounded p-1">
						<button
							on:click|stopPropagation={() => handleNavItemClick(itemKey)}
							id="mega-menu-{itemKey.toLowerCase()}-full-dropdown-button"
							data-collapse-toggle="mega-menu-full-dropdown"
							class="flex items-center justify-between hover:text-blue-700"
							>{itemKey}
							<svg
								class="w-2.5 h-2.5 ms-2.5"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 10 6"
							>
								<path
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="m1 1 4 4 4-4"
								/>
							</svg></button
						>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</nav>
