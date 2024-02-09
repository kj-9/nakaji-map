<script lang="ts">
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { get } from 'svelte/store';

	import Map from '$lib/components/MapPane.svelte';
	import NavBar from '$lib/components/navbar/NavBar.svelte';
	import NoSSR from '$lib/components/NoSSR.svelte';
	import { geodata } from '$lib/store';
	import type { FeatureForPopup } from '$lib/store';

	import About from '$lib/components/navbar/content/About.svelte';
	import News from '$lib/components/navbar/content/News.svelte';
	import SearchTable from '$lib/components/navbar/content/SearchTable.svelte';

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
	<title
		>福岡グルメ 中島浩二チャンネルマップ | ナカジーが紹介した福岡グルメ店を地図上に表示しています。</title
	>
	<meta
		name="description"
		content="中島浩二(ナカジー)が紹介した福岡グルメ店を地図上に表示しています。中島浩二さんは,通称ナカジーと呼ばれる福岡を中心に活動されているタレントです。本サイトは中島浩二チャンネルのファンサイト、中島浩二チャンネルマップです。"
	/>
	<link rel="canonical" href="https://nakaji-map.kj-dev.net/" />
</svelte:head>

<NoSSR>
	<div class="relative">
		<Map {initialFlyFeature} />
		<div class="absolute top-5 left-5">
			<NavBar showAbout={!initialFlyFeature} />
		</div>
	</div>

	<svelte:fragment slot="fallback">
		<About />
		(注意) 地図を表示するにはJavascriptを有効にしてください。
		<News />
		<SearchTable />
	</svelte:fragment>
</NoSSR>
