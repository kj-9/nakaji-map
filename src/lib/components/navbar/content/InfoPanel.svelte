<script lang="ts">
	import { geodata } from '$lib/store';
	import { get } from 'svelte/store';
	import { createEventDispatcher } from 'svelte';
	import { instanceOfFeatureForPopup, flyTo } from '$lib/components/Popup';
	import { formatDateStr } from '$lib/formatter';

	const dispatch = createEventDispatcher();

	const newFeatures = get(geodata)
		.features.slice(0, 5)
		.filter((feature) => instanceOfFeatureForPopup(feature))
		.sort(
			(a, b) =>
				new Date(b.properties.publishedAt).getTime() - new Date(a.properties.publishedAt).getTime()
		);
</script>

<div class="space-y-4 text-gray-900">
	<section class="bg-gray-50 rounded-xl px-3 sm:px-4 py-4 shadow-sm border border-gray-100">
		<h1 class="text-lg sm:text-xl font-semibold">福岡グルメ 中島浩二チャンネルマップ</h1>
		<p class="mt-2 text-xs sm:text-sm leading-relaxed text-gray-800">
			本サイトは
			<a
				href="https://www.youtube.com/channel/UCcWWwmgV5dLmqUJCtAZqHfw"
				class="text-blue-600 hover:underline"
				target="_blank"
				rel="noreferrer">中島浩二チャンネル</a
			>
			のファンサイトです。動画で紹介された福岡市近郊のお店を地図にまとめています。
		</p>
		<p class="mt-2 text-xs sm:text-sm leading-relaxed text-gray-800">
			中島浩二さん（ナカジー）は福岡を中心に活動されるタレントで、チャンネルでは地元グルメを紹介されています。
		</p>
		<h2 class="mt-4 font-semibold text-sm sm:text-base">利用上の注意</h2>
		<p class="mt-2 text-xs sm:text-sm leading-relaxed text-gray-800">
			お店の名前や位置情報に誤りがある可能性があります。誤りのご指摘・修正のご依頼は
			<a
				href="https://github.com/kj-9/nakaji-map/issues/new"
				class="text-blue-600 hover:underline"
				target="_blank"
				rel="noreferrer">GitHubのIssue</a
			>
			からお願いします。
		</p>
	</section>

	<section class="bg-white rounded-xl px-3 sm:px-4 py-4 shadow-sm border border-gray-100">
		<div class="flex items-baseline gap-2">
			<h2 class="text-base sm:text-lg font-semibold text-gray-900">最近の更新</h2>
			<span class="text-xs text-gray-500">最新5件</span>
		</div>
		<ul class="mt-2 space-y-2">
			{#each newFeatures as feature (feature.properties.video_id)}
				<li>
					<button
						class="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition"
						on:click={() => {
							dispatch('fly');
							flyTo(feature);
						}}
					>
						<div class="text-xs text-gray-500">{formatDateStr(feature.properties.publishedAt)}</div>
						<div class="text-sm sm:text-base text-gray-800 line-clamp-2">
							{feature.properties.title}
						</div>
						<div class="text-xs text-gray-600 line-clamp-1">
							{feature.properties.name || feature.properties.google_maps}
						</div>
					</button>
				</li>
			{/each}
		</ul>
	</section>
</div>
