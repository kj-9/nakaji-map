<script lang="ts">
import { onMount } from 'svelte';
import { fade } from 'svelte/transition';
import { page } from '$app/stores';
import { browser } from '$app/environment';
import { get } from 'svelte/store';

	import Map from '$lib/components/MapPane.svelte';
	import NavBar from '$lib/components/navbar/NavBar.svelte';
	import { geodata } from '$lib/store';
	import type { FeatureForPopup } from '$lib/store';

	export let initialFlyFeature: FeatureForPopup;
	let mounted = false;
	let showAbout = false;
	let mapLoaded = false;
	let showPlaceholder = true;
	let showLoading = true;

	onMount(() => {
		if (browser) {
			mounted = true;
		}
	});

	$: showLoading = !mounted || showPlaceholder;

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

<div class="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
	{#if mounted}
		<Map
			{initialFlyFeature}
			on:loaded={() => {
				mapLoaded = true;
				setTimeout(() => {
					showPlaceholder = false;
				}, 250);
			}}
		/>
	{/if}

	<div class="absolute top-5 left-5">
		<NavBar bind:showAbout initialOpen={true} initialTab="info" />
	</div>

	{#if showLoading}
		<div
			class="absolute inset-0 z-10 pointer-events-none flex items-center justify-center"
			transition:fade={{ duration: 200 }}
		>
			<div class="absolute inset-0 bg-gradient-to-br from-slate-100 via-white to-slate-200 animate-pulse opacity-90"></div>
			<div class="relative text-sm text-gray-700 bg-white/80 backdrop-blur px-5 py-3 rounded-full shadow">
				マップを準備中…
			</div>
		</div>
	{/if}

	<noscript>
		<div class="absolute inset-0 z-20 flex items-center justify-center px-4">
			<div class="w-full max-w-md p-6 text-center text-sm text-red-700 bg-red-50 rounded-md shadow">
				地図を表示するには JavaScript を有効にしてください。
			</div>
		</div>
	</noscript>
</div>
