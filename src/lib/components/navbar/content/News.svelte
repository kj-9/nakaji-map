<script lang="ts" context="module">
	import { geodata } from '$lib/store';
	import { get } from 'svelte/store';
	import { instanceOfFeatureForPopup } from '$lib/components/Popup';
	import { flyTo } from '$lib/components/Popup';
	import { formatDateStr } from '$lib/formatter';

	// check if geodata.features is Feature[] using instanceOfFeatureForPopup
	// note that geodata.features is array of feature, so we need to map over it
	// and check each feature
	const newFeatures = get(geodata)
		.features.slice(0, 5) // latest 5 features
		.filter((feature) => instanceOfFeatureForPopup(feature));
</script>

<ul>
	<div class="font-semibold">最近の更新</div>
	{#each newFeatures as feature}
		<li>
			<button class="mt-1 text-xs sm:text-base text-left" on:click={() => flyTo(feature)}>
				{formatDateStr(feature.properties.publishedAt)}: {feature.properties.title}
			</button>
		</li>
	{/each}
</ul>
