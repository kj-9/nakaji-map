<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import InfoPanel from '$lib/components/navbar/content/InfoPanel.svelte';
	import SearchTable from '$lib/components/navbar/content/SearchTable.svelte';

	type Tab = 'info' | 'search';

	export let showAbout = false;
	export let initialOpen = false;
	export let initialTab: Tab = 'info';

	let panelOpen = initialOpen;
	let activeTab: Tab = initialTab;
	let lastTab: Tab = initialTab;

	onMount(() => {
		if (!browser) return;
		const saved = localStorage.getItem('nakaji-map-tab') as Tab | null;
		const validSaved = saved === 'info' || saved === 'search' ? saved : null;

		// 初回表示では initialTab を優先し、明示的に開きたいタブを指定した場合に上書きしない
		if (!initialOpen && validSaved) {
			activeTab = validSaved;
			lastTab = validSaved;
		}
		if (showAbout) {
			panelOpen = true;
			activeTab = 'info';
			lastTab = 'info';
		}
	});

	$: if (browser) {
		if (activeTab !== lastTab) {
			lastTab = activeTab;
			localStorage.setItem('nakaji-map-tab', activeTab);
		}
	}

	$: if (showAbout) {
		panelOpen = true;
		activeTab = 'info';
	}

	const togglePanel = () => {
		panelOpen = !panelOpen;
		showAbout = panelOpen && activeTab === 'info';
	};

	const selectTab = (tab: Tab) => {
		activeTab = tab;
		panelOpen = true;
		showAbout = tab === 'info';
	};

	const closePanel = () => {
		panelOpen = false;
		showAbout = false;
	};
</script>

<nav class="relative z-30">
	<button
		class="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/90 px-3 py-1.5 text-sm font-semibold shadow hover:border-blue-200 hover:text-blue-700 transition"
		on:click={togglePanel}
		aria-pressed={panelOpen}
	>
		<svg
			class="h-4 w-4"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 6h16M4 12h16M4 18h16"
			/>
		</svg>
		Menu
		<span class="text-xs font-normal text-gray-500">/ {activeTab}</span>
	</button>

	{#if panelOpen}
		<div
			class="fixed inset-0 z-20"
			role="button"
			tabindex="0"
			aria-label="Close menu"
			on:click={closePanel}
			on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && closePanel()}
		></div>
	{/if}

	{#if panelOpen}
		<div class="absolute left-0 top-12 z-30" transition:slide={{ duration: 160, axis: 'y' }}>
			<div
				class="w-[min(760px,94vw)] rounded-2xl bg-white/95 shadow-2xl backdrop-blur border border-gray-200 overflow-hidden"
			>
				<div
					class="flex items-center justify-between px-4 py-3 border-b sticky top-0 z-30 bg-white/95 backdrop-blur"
				>
					<div class="flex gap-2 text-sm font-semibold text-gray-800">
						<button
							class="px-3 py-1.5 rounded-lg border text-xs sm:text-sm transition {activeTab ===
							'info'
								? 'bg-blue-600 text-white border-blue-600'
								: 'bg-white text-gray-700 border-gray-200 hover:border-blue-200'}"
							on:click={() => selectTab('info')}
						>
							Info
						</button>
						<button
							class="px-3 py-1.5 rounded-lg border text-xs sm:text-sm transition {activeTab ===
							'search'
								? 'bg-blue-600 text-white border-blue-600'
								: 'bg-white text-gray-700 border-gray-200 hover:border-blue-200'}"
							on:click={() => selectTab('search')}
						>
							Search
						</button>
					</div>
					<button
						class="rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition"
						on:click={closePanel}
						aria-label="Close menu"
					>
						<svg
							class="h-5 w-5"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
					</button>
				</div>
				<div class="relative max-h-[80vh] overflow-auto bg-white px-3 sm:px-4 pb-4 pt-0">
					{#if activeTab === 'info'}
						<InfoPanel on:fly={closePanel} />
					{:else}
						<SearchTable on:fly={closePanel} />
					{/if}
				</div>
			</div>
		</div>
	{/if}
</nav>
