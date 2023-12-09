<script lang="ts" context="module">
	import geojson from '../../../../../data/app-geojson.json';
	import { map } from '$lib/store';
	import { get } from 'svelte/store';
	import { createPopup, type FeatureForPopup } from '$lib/components/Popup';
	import { instanceOfFeatureForPopup } from '$lib/components/Popup';

	// check if geojson.features is Feature[] using instanceOfFeatureForPopup
	// note that geojson.features is array of feature, so we need to map over it
	// and check each feature
	const newFeatures = geojson.features
		.slice(0, 5) // latest 5 features
		.filter((feature) => instanceOfFeatureForPopup(feature)) as FeatureForPopup[];

	function flyTo(feature: FeatureForPopup) {
		const popup = createPopup(feature.geometry.coordinates, feature.properties);

		const [lng, lat] = feature.geometry.coordinates;

		const _map = get(map);

		_map.flyTo({
			speed: 1,
			curve: 1,
			easing(t) {
				return t;
			},
			essential: true,
			center: [lng, lat],
			zoom: 15
		});
		// wait for flyTo
		setTimeout(() => {
			popup.addTo(_map);
		}, 1000);
	}
</script>

<ul>
	{#each newFeatures as feature}
		<li>
			<button class="mt-1 text-xs sm:text-base" on:click={() => flyTo(feature)}>
				{new Date(feature.properties.publishedAt).toLocaleDateString('ja-JP', {
					year: 'numeric',
					month: '2-digit',
					day: '2-digit'
				})}: {feature.properties.title}
			</button>
		</li>
	{/each}
</ul>
