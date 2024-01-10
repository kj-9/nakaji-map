<script lang="ts">
	import Map from '$lib/components/MapPane.svelte';
	import NavBar from '$lib/components/navbar/NavBar.svelte';
	import { get } from 'svelte/store';
	import { geodata } from '$lib/store';
	import type { FeatureForPopup } from '$lib/store';

	export let data;

	const { videoId } = data;
	export let initialFlyFeature: FeatureForPopup;

	if (videoId) {
		const _geodata = get(geodata);
		console.log('searching videoId', videoId);
		_geodata.features.forEach((feature) => {
			if (feature.properties.video_id === videoId) {
				initialFlyFeature = feature;
				return;
			}
		});
	}
</script>

<svelte:head>
	<title>中島浩二チャンネルマップ</title>
	<meta name="description" content="中島浩二チャンネルマップ(ファンサイト)" />
</svelte:head>

<div class="relative">
	<Map {initialFlyFeature} />

	<div class="absolute top-5 left-5">
		<NavBar />
	</div>
</div>
