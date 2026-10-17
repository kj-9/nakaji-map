import { expect, test } from '@playwright/test';
import geodata from '../data/app-geojson.json' with { type: 'json' };

const newest = [...geodata.features].sort(
	(a, b) => Date.parse(b.properties.publishedAt) - Date.parse(a.properties.publishedAt)
);
const recent = newest.slice(0, 3).map(({ properties }) => properties);
const invalidLocation = newest.find(({ geometry }) => {
	const [longitude, latitude] = geometry.coordinates;
	return longitude === 0 && latitude === 0;
})?.properties;
if (!invalidLocation) throw new Error('Expected a newest video with an invalid location');

const storeName = (store: (typeof recent)[number]) =>
	store.name ?? store.google_maps ?? store.address;
const locationDate = (publishedAt: string) =>
	new Date(publishedAt).toLocaleDateString('ja-JP', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		timeZone: 'Asia/Tokyo'
	});

test.beforeEach(async ({ page }) => {
	// Keep map interaction tests independent of external tiles and API credentials.
	await page.route('https://api.protomaps.com/**', (route) =>
		route.fulfill({ contentType: 'application/x-protobuf', body: '' })
	);
});

test('recent stores show three entries, video subtitles, and unknown locations', async ({
	page
}) => {
	await page.goto('/');
	const candidates = page.getByRole('region', { name: 'お店の候補' });
	await expect(page.getByRole('heading', { name: '最近紹介されたお店' })).toBeVisible();
	await expect(candidates.locator('.restaurant-row')).toHaveCount(3);

	for (const store of recent) {
		const row = candidates.locator('.restaurant-row').filter({ hasText: store.title });
		await expect(row).toBeVisible();
		await expect(row).toContainText(store.title);
	}

	const invalidRow = candidates.locator('.restaurant-row').filter({
		hasText: invalidLocation.title
	});
	await expect(invalidRow).toContainText('場所未確認');
	await expect(invalidRow).toContainText(locationDate(invalidLocation.publishedAt));
});

test('category picker is a single-select dialog', async ({ page }) => {
	await page.goto('/');
	await page.getByRole('button', { name: 'カテゴリ一覧' }).click();
	const dialog = page.getByRole('dialog', { name: '何を食べたい？' });
	await expect(dialog).toBeVisible();
	await dialog.getByRole('button', { name: '寿司', exact: true }).click();
	await expect(dialog).toBeHidden();

	await page.getByRole('button', { name: 'カテゴリ一覧' }).click();
	const reopenedDialog = page.getByRole('dialog', { name: '何を食べたい？' });
	const selectedCategory = reopenedDialog.getByRole('button', { name: '寿司', exact: true });
	await expect(selectedCategory).toHaveAttribute('aria-pressed', 'true');
	await reopenedDialog.getByRole('button', { name: 'ラーメン', exact: true }).click();
	await expect(reopenedDialog).toBeHidden();

	await page.getByRole('button', { name: 'カテゴリ一覧' }).click();
	const finalDialog = page.getByRole('dialog', { name: '何を食べたい？' });
	await expect(finalDialog.getByRole('button', { name: 'ラーメン', exact: true })).toHaveAttribute(
		'aria-pressed',
		'true'
	);
	await expect(finalDialog.getByRole('button', { name: '寿司', exact: true })).toHaveAttribute(
		'aria-pressed',
		'false'
	);
	await finalDialog.getByRole('button', { name: 'すべて', exact: true }).click();
});

test('store details are shareable and restored from the URL', async ({ page }) => {
	const chosen = newest.find(({ geometry }) => {
		const [longitude, latitude] = geometry.coordinates;
		return longitude !== 0 && latitude !== 0;
	})?.properties;
	if (!chosen) throw new Error('Expected a store with valid coordinates');

	await page.goto('/');
	const candidates = page.getByRole('region', { name: 'お店の候補' });
	const row = candidates.locator('.restaurant-row').filter({ hasText: chosen.title });
	await expect(row).toBeVisible();
	await row.click();

	const detail = page.getByRole('region', { name: 'お店の詳細' });
	await expect(detail).toBeVisible();
	await expect(detail).toContainText(storeName(chosen));
	await expect(detail).toContainText(chosen.title);
	await expect(detail.getByRole('link', { name: '紹介動画を見る' })).toHaveAttribute(
		'href',
		`https://www.youtube.com/watch?v=${chosen.video_id}`
	);
	await expect(page).toHaveURL(new RegExp(`videoid=${chosen.video_id}`));

	await page.reload();
	const restoredDetail = page.getByRole('region', { name: 'お店の詳細' });
	await expect(restoredDetail).toBeVisible();
	await expect(restoredDetail).toContainText(storeName(chosen));
	await expect(restoredDetail).toContainText(chosen.title);
	await page.getByRole('button', { name: '候補に戻る' }).click();
	await expect(page.getByRole('region', { name: 'お店の候補' })).toBeVisible();
});

test('map and store-list display modes can be switched', async ({ page }) => {
	await page.goto('/');
	const map = page.getByRole('region', { name: 'Map', exact: true });
	await expect(map).toBeVisible();
	await page.getByRole('button', { name: 'お店を全画面に' }).click();
	await expect(page.getByRole('region', { name: 'お店の候補' })).toBeVisible();
	await page.getByRole('button', { name: '地図と並べる' }).click();
	await expect(map).toBeVisible();
	await page.getByRole('button', { name: '地図を広く見る' }).click();
	await expect(map).toBeVisible();
	await page.getByRole('button', { name: 'お店を見る' }).click();
	await expect(page.getByRole('region', { name: 'お店の候補' })).toBeVisible();
});

test.describe('mobile viewport', () => {
	test.use({ isMobile: true, hasTouch: true });

	test('map, category dialog, and details stay within the viewport', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/');
		await expect(page.getByRole('region', { name: 'Map', exact: true })).toBeVisible();

		for (const viewport of [
			{ width: 390, height: 844 },
			{ width: 390, height: 560 },
			{ width: 844, height: 390 }
		]) {
			await page.setViewportSize(viewport);
			await expect
				.poll(() =>
					page.evaluate(
						() =>
							document.documentElement.scrollWidth - window.innerWidth <= 1 &&
							document.documentElement.scrollHeight - window.innerHeight <= 1
					)
				)
				.toBe(true);
		}

		await page.setViewportSize({ width: 390, height: 844 });
		await page.getByRole('button', { name: 'カテゴリ一覧' }).click();
		const dialog = page.getByRole('dialog', { name: '何を食べたい？' });
		await expect(dialog).toBeVisible();
		await expect
			.poll(() =>
				dialog.evaluate((element) => {
					const bounds = element.getBoundingClientRect();
					return bounds.left >= 0 && bounds.right <= window.innerWidth;
				})
			)
			.toBe(true);
		await dialog.getByRole('button', { name: 'すべて', exact: true }).click();

		const chosen = newest.find(({ geometry }) => {
			const [longitude, latitude] = geometry.coordinates;
			return longitude !== 0 && latitude !== 0;
		})?.properties;
		if (!chosen) throw new Error('Expected a store with valid coordinates');
		await page
			.getByRole('region', { name: 'お店の候補' })
			.locator('.restaurant-row')
			.filter({ hasText: chosen.title })
			.click();
		await expect(page.getByRole('region', { name: 'お店の詳細' })).toBeVisible();
		await expect
			.poll(() =>
				page.evaluate(
					() =>
						document.documentElement.scrollWidth - window.innerWidth <= 1 &&
						document.documentElement.scrollHeight - window.innerHeight <= 1
				)
			)
			.toBe(true);
	});
});

test('map gestures update the area without a search button and store selection preserves it', async ({
	page
}) => {
	await page.goto('/');
	await expect(page.getByText('マップを準備中…')).toBeHidden({ timeout: 30000 });
	await page.getByRole('button', { name: 'Zoom in', exact: true }).click();
	await expect(page.getByRole('heading', { name: 'この範囲のお店', exact: true })).toBeVisible();
	await expect(page.getByRole('button', { name: 'この範囲で探す' })).toHaveCount(0);
	const rows = page.locator('.restaurant-row');
	await expect(rows.first()).toBeVisible();
	const before = await rows.allTextContents();
	await rows.first().click();
	await expect(page.getByRole('region', { name: 'お店の詳細' })).toBeVisible();
	await page.getByRole('button', { name: '候補に戻る' }).click();
	await expect.poll(() => rows.allTextContents()).toEqual(before);
	await page.getByRole('button', { name: '最近の紹介に戻る' }).click();
	await expect(page.getByRole('heading', { name: '最近紹介されたお店' })).toBeVisible();
});

test('text search can find older videos and recover from no results', async ({ page }) => {
	await page.goto('/');
	const search = page.getByRole('searchbox', { name: 'お店や動画を検索' });
	await search.fill('存在しないお店000000');
	await expect(
		page.getByRole('heading', { name: 'この条件のお店は見つかりませんでした' })
	).toBeVisible();
	await page.getByRole('button', { name: '検索を解除する' }).click();
	await expect(page.locator('.restaurant-row')).toHaveCount(3);
	const older = newest[20].properties;
	await search.fill(older.title);
	await expect(page.locator('.restaurant-row').filter({ hasText: older.title })).toBeVisible();
});
