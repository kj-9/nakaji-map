<script lang="ts">
	import { geodata } from '$lib/store';
	import { get } from 'svelte/store';
	import { createEventDispatcher } from 'svelte';
	import { instanceOfFeatureForPopup } from '$lib/components/Popup';
	import { flyTo } from '$lib/components/Popup';
	import { formatDateStr } from '$lib/formatter';

	// check if geodata.features is Feature[] using instanceOfFeatureForPopup
	// note that geodata.features is array of feature, so we need to map over it
	// and check each feature
	const newFeatures = get(geodata)
		.features.slice(0, 5) // latest 5 features
		.filter((feature) => instanceOfFeatureForPopup(feature));

	const dispatch = createEventDispatcher();
</script>

<div class="bg-gray-50 max-w-xs sm:max-w-2xl px-4 py-5 text-gray-900">
	<form class="absolute top-0 right-0 mt-1 mr-1" method="dialog">
		<button
			type="submit"
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

	<ul>
		<h1 class="text-lg sm:text-xl font-semibold">最近の更新</h1>
		{#each newFeatures as feature}
			<li>
				<button
					class="mt-1 text-xs sm:text-base text-left"
					on:click={() => {
						dispatch('fly');
						flyTo(feature);
					}}
				>
					{formatDateStr(feature.properties.publishedAt)}: {feature.properties.title}
				</button>
			</li>
		{/each}
	</ul>
</div>
