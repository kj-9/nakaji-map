<script lang="ts">
	import iconYouTubeURL from '../../asset/icons8-youtube-48.png';
	import iconGoogleMapURL from '../../asset/icons8-googlemap-48.png';
	import { formatDateStr } from '$lib/formatter';

	export let name: string;
	export let publishedAt: string;
	export let title: string;
	export let video_id: string;
	export let google_maps: string;
	export let address: string;
	export let category: string | undefined;

	// if google_map is not set, use address as google_map
	if (!google_maps) {
		google_maps = address;
	}
	const gmapURL = encodeURI(`https://www.google.com/maps/search/${google_maps}`);

	const videoURL = `https://www.youtube.com/watch?v=${video_id}`;

	const date = formatDateStr(publishedAt);
</script>

<div class="rounded-lg text-sm">
	<div class="mb-2">
		<h2 class="font-bold flex items-center gap-2 flex-wrap">
			<span>{name}</span>
			{#if category}
				<span
					class="inline-flex items-center rounded-full bg-blue-50 text-blue-700 text-[11px] px-2 py-0.5 border border-blue-100"
				>
					{category}
				</span>
			{/if}
		</h2>
		<span class="text-gray-800">{date}</span>
	</div>
	<p>{title}</p>

	<div class="mt-2 inline-flex items-center">
		<a href={videoURL} target="_blank" rel="noreferrer noopener"
			><img class="h-8" src={iconYouTubeURL} alt="Watch on YouTube" /></a
		>
		<a href={gmapURL} target="_blank" rel="noreferrer noopener"
			><img class="h-8" src={iconGoogleMapURL} alt="Open in Google Maps" /></a
		>
	</div>

	<div class="mt-2">
		<a class="text-gray-300 text-xs" target="_blank" href="https://icons8.com">icon by Icons8</a>
	</div>
</div>

<style>
	/* override maplibre-gl's style sheet */
	:global(.maplibregl-popup-close-button) {
		font-size: 20px;
	}
</style>
