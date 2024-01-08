<script lang="ts">
	import About from '$lib/components/navbar/content/About.svelte';
	import News from '$lib/components/navbar/content/News.svelte';
	import { onMount } from 'svelte';

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
			selectedNavItem = null;
			return;
		}

		// select new item
		selectedNavItem = itemKey;
		document.body.addEventListener('click', handleMenuClose);
	}

	function handleMenuClose() {
		selectedNavItem = null;
		console.log('close');
		document.body.removeEventListener('click', handleMenuClose);
	}

	// show 'about' from start
	onMount(() => {
		handleNavItemClick('About');
	});
</script>

<nav>
	<div class="flex flex-wrap justify-between items-center">
		<div id="mega-menu-full" class="items-center justify-between font-medium">
			<ul class="flex space-x-8 flex-row">
				{#each getItemsKeys() as itemKey}
					<li class="{selectedNavItem == itemKey ? 'bg-gray-50' : ''}  rounded p-1">
						<button
							on:click|stopPropagation={() => handleNavItemClick(itemKey)}
							id="mega-menu-full-dropdown-button"
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
			{#if selectedNavItem}
				<button
					id="mega-menu-full-dropdown"
					class="mt-1 bg-gray-50 rounded max-w-xs sm:max-w-2xl px-4 py-5 text-gray-900"
					on:click|stopPropagation={() => {}}
				>
					<svelte:component this={navBarItems[selectedNavItem]} />
				</button>
			{/if}
		</div>
	</div>
</nav>
