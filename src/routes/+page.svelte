<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { get } from 'svelte/store';

	import Map from '$lib/components/MapPane.svelte';
	import NavBar from '$lib/components/navbar/NavBar.svelte';
	import { geodata } from '$lib/store';
	import type { FeatureForPopup } from '$lib/store';

	export let initialFlyFeature: FeatureForPopup;

	if (browser) {
		const videoId = $page.url.searchParams.get('videoid');

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
	}
</script>

<svelte:head>
	<title>中島浩二チャンネルマップ</title>
	<meta name="description" content="中島浩二チャンネルマップ(ファンサイト)" />
</svelte:head>

<div class="relative">
	<Map {initialFlyFeature} />

	<div class="absolute top-5 left-5">
		<NavBar showAbout={!initialFlyFeature} />
	</div>
</div>
