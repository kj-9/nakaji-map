<script lang="ts">
import { onMount } from 'svelte';
import { page } from '$app/stores';
import { browser } from '$app/environment';
import { get } from 'svelte/store';

	import Map from '$lib/components/MapPane.svelte';
	import NavBar from '$lib/components/navbar/NavBar.svelte';
	import { geodata } from '$lib/store';
	import type { FeatureForPopup } from '$lib/store';

	import About from '$lib/components/navbar/content/About.svelte';
	import News from '$lib/components/navbar/content/News.svelte';
	import SearchTable from '$lib/components/navbar/content/SearchTable.svelte';

	export let initialFlyFeature: FeatureForPopup;
	let mounted = false;

	onMount(() => {
		if (browser) mounted = true;
	});

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

{#if mounted}
	<div class="relative">
		<Map {initialFlyFeature} />
		<div class="absolute top-5 left-5">
			<NavBar showAbout={!initialFlyFeature} />
		</div>
	</div>
{:else}
		<div class="flex flex-col items-center justify-center gap-4 py-12 text-center">
			<div class="text-xl font-semibold text-gray-800">地図を読み込み中…</div>
			<div class="text-sm text-gray-600">
				JavaScript が無効な場合は地図が表示されません。<br />
				少し待っても表示されないときはページを再読み込みしてください。
			</div>
			<div class="h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-500"></div>
		</div>
		<noscript>
			<div class="p-6 text-center text-sm text-red-700 bg-red-50 rounded-md">
				地図を表示するには JavaScript を有効にしてください。
			</div>
		</noscript>
{/if}
