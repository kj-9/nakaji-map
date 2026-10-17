import { expect, test } from '@playwright/test';
import geodata from '../data/app-geojson.json' with { type: 'json' };

const latest = [...geodata.features].sort(
	(a, b) => Date.parse(b.properties.publishedAt) - Date.parse(a.properties.publishedAt)
)[0].properties;
const latestName = latest.name ?? latest.google_maps ?? latest.address;
if (!latestName) throw new Error('Latest feature must identify a store');
const latestDate = new Date(latest.publishedAt).toLocaleDateString('ja-JP', {
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

test('latest data opens a map popup and can be found by search', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));
	await page.goto('/');
	await expect(page.getByRole('heading', { name: '最近の更新' })).toBeVisible();
	await expect(page.getByText('マップを準備中…')).toBeHidden({ timeout: 30000 });
	await expect(page.getByRole('region', { name: 'Map', exact: true })).toBeVisible();
	await page.getByRole('button').filter({ hasText: latest.title }).click();
	await expect(page.getByRole('heading', { name: latestName, exact: false })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Watch on YouTube' })).toHaveAttribute(
		'href',
		`https://www.youtube.com/watch?v=${latest.video_id}`
	);
	await expect(page.getByText(latestDate, { exact: true })).toBeVisible();
	await expect(page).toHaveURL(new RegExp(`videoid=${latest.video_id}`));
	await page.getByRole('button', { name: 'Close popup' }).click();
	await page.getByRole('button', { name: /Menu/ }).click();
	await page.getByRole('button', { name: 'Search', exact: true }).click();
	await page.getByRole('textbox').fill(latestName);
	await expect(page.getByText(latest.title, { exact: true })).toBeVisible();
	expect(errors).toEqual([]);
});

test('direct video links open the selected store', async ({ page }) => {
	await page.goto(`/?videoid=${latest.video_id}`);
	await expect(page.getByText('マップを準備中…')).toBeHidden({ timeout: 30000 });
	await expect(page.getByRole('heading', { name: latestName, exact: false })).toBeVisible();
});
