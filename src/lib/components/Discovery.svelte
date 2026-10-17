<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { categorizedFeatures } from '#lib/store.js';
	import type { FeatureForPopup } from '#lib/store.js';
	import { CATEGORIES } from '#lib/category.js';
	import { hasLocation, inBounds, matchesChoice, storeName } from '#lib/discovery.js';
	import type { Bounds, FoodChoice } from '#lib/discovery.js';
	import { formatDateStr } from '#lib/formatter.js';
	import MapPane from './MapPane.svelte';

	let mounted = false;
	let loaded = false;
	let category: FoodChoice = 'すべて';
	let query = '';
	let area: Bounds | null = null;
	let panelOpen = true;
	let fullScreen = false;
	let panelHeight = 0;
	let panel: HTMLElement;
	let categoryDialog: HTMLDialogElement;
	let aboutDialog: HTMLDialogElement;
	let categoryTrigger: HTMLButtonElement;
	let selected: FeatureForPopup | undefined;
	let showAll = false;
	let message = '';
	let toastTimer: ReturnType<typeof setTimeout>;
	const categories: FoodChoice[] = [
		'すべて',
		'ラーメン',
		'うどん',
		'肉',
		...CATEGORIES.filter((c) => !['ラーメン', 'うどん', 'その他'].includes(c)),
		'その他'
	];
	$: shortcuts = [
		...new Set<FoodChoice>([
			'すべて',
			'ラーメン',
			'うどん',
			...(category !== 'すべて' ? [category] : [])
		])
	];
	$: matches = $categorizedFeatures.filter(
		(f) =>
			matchesChoice(f, category) &&
			(!query.trim() ||
				[
					f.properties.name,
					f.properties.title,
					f.properties.google_maps,
					f.properties.address
				].some((v) => v?.toLowerCase().includes(query.trim().toLowerCase())))
	);
	$: results = area ? matches.filter((f) => inBounds(f, area!)) : matches;
	$: visible = showAll || area || query.trim() ? results : results.slice(0, 3);
	$: heading = area
		? `この範囲の${category === 'すべて' ? 'お店' : category}`
		: query.trim()
			? '検索したお店'
			: category === 'すべて'
				? '最近紹介されたお店'
				: `最近紹介された${category}`;

	onMount(() => {
		const restore = () => {
			selected = $categorizedFeatures.find(
				(f) => f.properties.video_id === new URL(location.href).searchParams.get('videoid')
			);
			if (selected) panelOpen = true;
		};
		restore();
		mounted = true;
		window.addEventListener('popstate', restore);
		return () => {
			window.removeEventListener('popstate', restore);
			clearTimeout(toastTimer);
		};
	});
	function updateUrl(id?: string) {
		const url = new URL(location.href);
		if (id) url.searchParams.set('videoid', id);
		else url.searchParams.delete('videoid');
		// Current URL already includes the configured base path.
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(url, { shallow: true, replace: true });
	}
	async function resetScroll() {
		await tick();
		panel?.querySelector('.panel-scroll')?.scrollTo(0, 0);
	}
	function openStore(feature: FeatureForPopup) {
		selected = feature;
		panelOpen = true;
		updateUrl(feature.properties.video_id);
		resetScroll();
	}
	function back() {
		selected = undefined;
		updateUrl();
		resetScroll();
	}
	function chooseCategory(next: FoodChoice) {
		category = next;
		showAll = false;
		back();
		categoryDialog?.close();
		categoryTrigger?.focus();
		resetScroll();
	}
	function updateArea(next: Bounds) {
		area = next;
		showAll = true;
		if (selected) back();
		resetScroll();
	}
	function recent() {
		area = null;
		showAll = false;
		resetScroll();
	}
	async function share() {
		try {
			await navigator.clipboard.writeText(location.href);
			message = 'お店のリンクをコピーしました';
		} catch {
			message = 'アドレスバーのURLをコピーして共有できます';
		}
		clearTimeout(toastTimer);
		toastTimer = setTimeout(() => (message = ''), 4500);
	}
</script>

<div class="discovery-app">
	<div class="map-surface" inert={panelOpen && fullScreen}>
		{#if mounted}
			<MapPane
				features={matches}
				{selected}
				panelHeight={panelOpen && !fullScreen ? panelHeight : 0}
				on:loaded={() => (loaded = true)}
				on:select={(event) => openStore(event.detail)}
				on:area={(event) => updateArea(event.detail)}
			/>
		{/if}
		<header class="map-brand">
			<button onclick={() => aboutDialog.showModal()} aria-label="サイトについて"
				>☰ <span>ナカジーのお店マップ</span></button
			>
		</header>
	</div>
	{#if !loaded}<div class="map-loading" role="status">マップを準備中…</div>{/if}
	{#if !panelOpen}<button class="restore-stores" onclick={() => (panelOpen = true)}
			>お店を見る ↑</button
		>{/if}
	{#if panelOpen}
		<section
			bind:this={panel}
			bind:clientHeight={panelHeight}
			class:full-screen={fullScreen}
			class:store-detail-panel={!!selected}
			class="discovery-panel"
			aria-label={selected ? 'お店の詳細' : 'お店の候補'}
		>
			<div class="panel-toolbar">
				{#if selected}<button class="back-button" onclick={back}>‹ 候補に戻る</button>{:else}<button
						class="primary-button"
						onclick={() => (fullScreen = !fullScreen)}
						>{fullScreen ? '地図と並べる' : 'お店を全画面に'}</button
					>{/if}
				{#if selected && fullScreen}<button onclick={() => (fullScreen = false)}
						>地図と並べる</button
					>{/if}
				<button
					onclick={() => {
						panelOpen = false;
						fullScreen = false;
					}}>地図を広く見る</button
				>
			</div>
			{#if selected}
				<div class="panel-scroll">
					<article class="store-detail">
						<h1>{storeName(selected)}</h1>
						<p class="store-address">
							{selected.properties.address || selected.properties.google_maps}{!hasLocation(
								selected
							)
								? ' ・ 場所未確認'
								: ''}
						</p>
						<a
							class="video-thumbnail"
							href={`https://www.youtube.com/watch?v=${selected.properties.video_id}`}
							target="_blank"
							rel="noreferrer"
							><img
								src={`https://i.ytimg.com/vi/${selected.properties.video_id}/hqdefault.jpg`}
								alt={`${storeName(selected)}の紹介動画`}
							/><span aria-hidden="true">▶</span></a
						>
						<a
							class="video-link"
							href={`https://www.youtube.com/watch?v=${selected.properties.video_id}`}
							target="_blank"
							rel="noreferrer">紹介動画を見る ↗</a
						>
						<h2>{selected.properties.title}</h2>
						<p class="store-date">{formatDateStr(selected.properties.publishedAt)}に紹介</p>
						<div class="store-actions">
							<a
								href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.properties.google_maps || selected.properties.address || storeName(selected))}`}
								target="_blank"
								rel="noreferrer">Google Mapsで開く ↗</a
							><button onclick={share}>リンクを共有</button>
						</div>
					</article>
				</div>
			{:else}
				<div class="discovery-heading">
					<h1>{area ? 'この辺で、何を食べよう？' : '次に食べに行きたいお店を見つけよう'}</h1>
					<div class="category-shortcuts" aria-label="食べたいものから選ぶ">
						{#each shortcuts as choice (choice)}<button
								class:active={category === choice}
								aria-pressed={category === choice}
								onclick={() => chooseCategory(choice)}>{choice}</button
							>{/each}<button
							bind:this={categoryTrigger}
							class="category-more"
							onclick={() => categoryDialog.showModal()}>カテゴリ一覧</button
						>
					</div>
				</div>
				<div class="panel-scroll">
					<div class="restaurant-results">
						<label class="store-search"
							><span class="sr-only">お店や動画を検索</span><input
								type="search"
								placeholder="お店や動画を検索"
								bind:value={query}
								oninput={resetScroll}
							/></label
						>
						<div class="results-heading">
							<h2>{heading}</h2>
							{#if area || query.trim()}<span>{results.length}件</span>{/if}
						</div>
						{#if area}<button class="reset-area" onclick={recent}>最近の紹介に戻る ×</button>{/if}
						{#if !results.length}<div class="empty-results">
								<h3>この条件のお店は見つかりませんでした</h3>
								<p>地図を広げるか、カテゴリを変えて探してみてください。</p>
								<button
									onclick={() => {
										panelOpen = false;
										fullScreen = false;
									}}>地図で範囲を広げる</button
								><button onclick={() => chooseCategory('すべて')}>すべてのカテゴリを見る</button
								>{#if query}<button onclick={() => (query = '')}>検索を解除する</button>{/if}
							</div>{/if}
						{#each visible as feature, index (feature.properties.video_id + '-' + index)}<button
								class="restaurant-row"
								onclick={() => openStore(feature)}
								><img
									src={`https://i.ytimg.com/vi/${feature.properties.video_id}/mqdefault.jpg`}
									alt=""
									loading={index < 3 ? 'eager' : 'lazy'}
								/><span class="row-copy"
									><strong>{storeName(feature)}</strong><span class="video-subtitle"
										>{feature.properties.title}</span
									><span class="store-date">{formatDateStr(feature.properties.publishedAt)}</span
									>{#if !hasLocation(feature)}<small>場所未確認</small>{/if}</span
								><span aria-hidden="true">›</span></button
							>{/each}
						{#if !showAll && !area && !query.trim() && results.length > 3}<button
								class="more-stores"
								onclick={() => (showAll = true)}>紹介されたお店をもっと見る ›</button
							>{/if}
					</div>
				</div>
			{/if}
		</section>
	{/if}
	<dialog
		bind:this={categoryDialog}
		class="discovery-dialog category-dialog"
		aria-labelledby="category-title"
	>
		<header>
			<h2 id="category-title">何を食べたい？</h2>
			<button onclick={() => categoryDialog.close()} aria-label="カテゴリ一覧を閉じる">×</button>
		</header>
		<p>カテゴリをひとつ選んでください</p>
		<div class="category-grid">
			{#each categories as choice (choice)}<button
					class:active={category === choice}
					aria-pressed={category === choice}
					onclick={() => chooseCategory(choice)}>{choice}</button
				>{/each}
		</div>
	</dialog>
	<dialog
		bind:this={aboutDialog}
		class="discovery-dialog about-dialog"
		aria-labelledby="about-title"
	>
		<header>
			<h2 id="about-title">このサイトについて</h2>
			<button onclick={() => aboutDialog.close()} aria-label="閉じる">×</button>
		</header>
		<h3>ナカジーが紹介した、おいしい福岡へ。</h3>
		<p>中島浩二チャンネルで紹介されたお店を、動画と地図から探すファンサイトです。</p>
		<p>
			地図を動かすと、表示範囲のお店に自動で絞り込みます。営業時間や営業状況はお店の公式情報をご確認ください。
		</p>
		<a
			href="https://www.youtube.com/channel/UCcWWwmgV5dLmqUJCtAZqHfw"
			target="_blank"
			rel="noreferrer">中島浩二チャンネル ↗</a
		>
		<p class="credits">
			地図: Protomaps / OpenStreetMap<br /><a
				href="https://icons8.com"
				target="_blank"
				rel="noreferrer">マーカーアイコン: Icons8</a
			>
		</p>
	</dialog>
	{#if message}<div class="share-toast" role="status">{message}</div>{/if}
	<noscript>お店と地図を表示するにはJavaScriptを有効にしてください。</noscript>
</div>
