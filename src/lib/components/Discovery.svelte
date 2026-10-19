<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import categoryIcon from '../../asset/category-adjustments.svg';
	import { goto } from '$app/navigation';
	import { categorizedFeatures } from '#lib/store.js';
	import type { FeatureForPopup } from '#lib/store.js';
	import { CATEGORIES } from '#lib/category.js';
	import { hasLocation, inBounds, matchesChoice, storeName } from '#lib/discovery.js';
	import type { Bounds, FoodChoice } from '#lib/discovery.js';
	import { formatDateStr } from '#lib/formatter.js';
	import MapPane from './MapPane.svelte';
	import SheetHandle from './SheetHandle.svelte';

	let mounted = false;
	let loaded = false;
	let category: FoodChoice = 'すべて';
	let query = '';
	let area: Bounds | null = null;
	let panelOpen = true;
	let fullScreen = false;
	let panelHeight = 0;
	let dragHeight: number | null = null;
	let reducedMotion = false;
	let panel: HTMLElement;
	let categoryDialog: HTMLDialogElement;
	let aboutDialog: HTMLDialogElement;
	let categoryTrigger: HTMLButtonElement;
	let categoryStrip: HTMLDivElement;
	let selected: FeatureForPopup | undefined;
	let showAll = false;
	let nearbyCandidates: FeatureForPopup[] | null = null;
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
	$: results = nearbyCandidates ?? (area ? matches.filter((f) => inBounds(f, area!)) : matches);
	$: visible =
		fullScreen || showAll || area || nearbyCandidates || query.trim()
			? results
			: results.slice(0, 3);
	$: heading = nearbyCandidates
		? '重なっているお店'
		: area
			? 'この範囲のお店'
			: query.trim()
				? '検索したお店'
				: '最近紹介されたお店';

	function highlightCategory(node: HTMLElement, choice: FoodChoice) {
		function measure() {
			const active = node.querySelector<HTMLElement>('[aria-pressed="true"]');
			if (!active) return;
			node.style.setProperty('--selection-x', `${active.offsetLeft}px`);
			node.style.setProperty('--selection-width', `${active.offsetWidth}px`);
		}
		void choice;
		const observer = new ResizeObserver(measure);
		observer.observe(node);
		measure();
		return {
			update() {
				tick().then(measure);
			},
			destroy() {
				observer.disconnect();
			}
		};
	}

	onMount(() => {
		const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
		const syncMotion = () => (reducedMotion = motion.matches);
		syncMotion();
		motion.addEventListener('change', syncMotion);
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
			motion.removeEventListener('change', syncMotion);
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
	async function setSheetMode(mode: 'map' | 'split' | 'full') {
		const focused = document.activeElement?.classList.contains('sheet-handle');
		panelOpen = mode !== 'map';
		fullScreen = mode === 'full';
		if (focused) {
			await tick();
			document.querySelector<HTMLButtonElement>('.sheet-handle')?.focus({ preventScroll: true });
		}
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
	async function chooseCategory(next: FoodChoice) {
		const fromDialog = categoryDialog?.open;
		nearbyCandidates = null;
		category = next;
		showAll = false;
		back();
		categoryDialog?.close();
		await tick();
		if (fromDialog) categoryTrigger?.focus({ preventScroll: true });
		const active = categoryStrip?.querySelector<HTMLElement>('[aria-pressed="true"]');
		if (active && categoryStrip) {
			const item = active.getBoundingClientRect();
			const strip = categoryStrip.getBoundingClientRect();
			const offset = item.left + item.width / 2 - (strip.left + strip.width / 2);
			categoryStrip.scrollTo({
				left: categoryStrip.scrollLeft + offset,
				behavior: reducedMotion ? 'instant' : 'smooth'
			});
		}
		resetScroll();
	}
	function updateArea(next: Bounds) {
		nearbyCandidates = null;
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
				{panel}
				{panelHeight}
				{panelOpen}
				{fullScreen}
				{reducedMotion}
				on:loaded={() => (loaded = true)}
				on:select={(event) => openStore(event.detail)}
				on:area={(event) => updateArea(event.detail)}
				on:candidates={(event) => {
					nearbyCandidates = event.detail;
					back();
					panelOpen = true;
				}}
			/>
		{/if}
		<header class="map-brand">
			<button onclick={() => aboutDialog.showModal()} aria-label="サイトについて"
				>☰ <span>ナカジーのお店マップ</span></button
			>
		</header>
	</div>
	{#if !loaded}<div class="map-loading" role="status">マップを準備中…</div>{/if}
	<section
		bind:this={panel}
		bind:clientHeight={panelHeight}
		class:full-screen={fullScreen}
		class:is-collapsed={!panelOpen && dragHeight === null}
		class:is-dragging={dragHeight !== null}
		style:height={dragHeight !== null ? `${dragHeight}px` : undefined}
		class:store-detail-panel={!!selected}
		class="discovery-panel"
		aria-label={panelOpen ? (selected ? 'お店の詳細' : 'お店の候補') : undefined}
	>
		<SheetHandle
			mode={!panelOpen ? 'map' : fullScreen ? 'full' : 'split'}
			onmodechange={setSheetMode}
			splitRatio={selected ? 0.59 : 0.54}
			ondrag={(height) => (dragHeight = height)}
		/>
		{#if panelOpen || dragHeight !== null}
			{#if selected}<div class="panel-toolbar">
					<button class="back-button" onclick={back}>‹ 候補に戻る</button>
				</div>{/if}

			{#if selected}
				<div class="panel-scroll">
					<article class="store-detail" in:fly={{ y: 10, duration: reducedMotion ? 0 : 180 }}>
						<h1>{storeName(selected)}</h1>
						<p class="store-address">
							{selected.properties.address || selected.properties.google_maps}{!hasLocation(
								selected
							)
								? ' ・ 場所未確認'
								: ''}
						</p>
						<a
							class="store-map-link"
							href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selected.properties.google_maps || selected.properties.address || storeName(selected))}`}
							target="_blank"
							rel="noreferrer">Google Mapsで開く ↗</a
						>
						<h2>{selected.properties.title}</h2>
						<p class="store-date">{formatDateStr(selected.properties.publishedAt)}に紹介</p>
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
						<div class="store-actions">
							<button onclick={share}>リンクを共有</button>
						</div>
					</article>
				</div>
			{:else}
				<div class="discovery-heading">
					<h1>お店の一覧</h1>
					<div class="category-controls">
						<div
							class="category-shortcuts"
							bind:this={categoryStrip}
							use:highlightCategory={category}
							aria-label="食べたいものから選ぶ"
						>
							{#each categories as choice (choice)}<button
									class:active={category === choice}
									aria-pressed={category === choice}
									onclick={() => chooseCategory(choice)}>{choice}</button
								>{/each}
						</div>
						<button
							bind:this={categoryTrigger}
							class="category-more"
							aria-label="カテゴリ一覧"
							aria-haspopup="dialog"
							onclick={() => categoryDialog.showModal()}
							><img src={categoryIcon} alt="" width="22" height="22" /></button
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
								oninput={() => {
									nearbyCandidates = null;
									resetScroll();
								}}
							/></label
						>
						<div class="results-heading">
							<h2>{heading}</h2>
							{#if nearbyCandidates || (!area && query.trim())}<span>{results.length}件</span>{/if}
						</div>
						{#if nearbyCandidates}
							<div class="area-status">
								<span role="status">拡大しても重なるお店です。一覧から選べます。</span>
								<button
									class="reset-area"
									onclick={() => {
										nearbyCandidates = null;
										resetScroll();
									}}>元の候補に戻る</button
								>
							</div>
						{:else if area}
							<div class="area-status">
								<span role="status">地図の範囲内・{results.length}件</span>
								<button class="reset-area" onclick={recent}>範囲指定を解除</button>
							</div>
						{/if}
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
						{#key category}<div class="category-results">
								{#each visible as feature, index (feature.properties.video_id + '-' + index)}<button
										class="restaurant-row"
										in:fly={{
											y: reducedMotion ? 0 : 7,
											duration: reducedMotion ? 0 : 220,
											delay: reducedMotion ? 0 : Math.min(index, 3) * 25,
											easing: cubicOut
										}}
										onclick={() => openStore(feature)}
										><img
											src={`https://i.ytimg.com/vi/${feature.properties.video_id}/mqdefault.jpg`}
											alt=""
											loading={index < 3 ? 'eager' : 'lazy'}
										/><span class="row-copy"
											><strong>{storeName(feature)}</strong><span class="video-subtitle"
												>{feature.properties.title}</span
											><span class="store-date"
												>{formatDateStr(feature.properties.publishedAt)}</span
											>{#if !hasLocation(feature)}<small>場所未確認</small>{/if}</span
										><span aria-hidden="true">›</span></button
									>{/each}
							</div>{/key}
						{#if !fullScreen && !showAll && !area && !nearbyCandidates && !query.trim() && results.length > 3}<button
								class="more-stores"
								onclick={() => (showAll = true)}>紹介されたお店をもっと見る ›</button
							>{/if}
					</div>
				</div>
			{/if}
		{/if}
	</section>
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
				rel="noreferrer">旧マーカーアイコン: Icons8</a
			>
			<br /><a href="https://pictogrammers.com/library/mdi/" target="_blank" rel="noreferrer"
				>マーカー枠: Material Design Icons</a
			>
		</p>
	</dialog>
	{#if message}<div class="share-toast" role="status">{message}</div>{/if}
	<noscript>お店と地図を表示するにはJavaScriptを有効にしてください。</noscript>
</div>
