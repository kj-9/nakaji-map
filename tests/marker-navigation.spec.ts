import { expect, test } from '@playwright/test';
import geodata from '../data/app-geojson.json' with { type: 'json' };

const colocatedStores = [
	...geodata.features
		.reduce((groups, feature) => {
			const coordinates = feature.geometry.coordinates;
			if (coordinates[0] === 0 || coordinates[1] === 0) return groups;
			const key = coordinates.join(',');
			groups.set(key, [...(groups.get(key) ?? []), feature]);
			return groups;
		}, new Map<string, typeof geodata.features>())
		.values()
]
	.filter((group) => group.length > 1)
	.sort((left, right) => right.length - left.length)[0];

async function openColocatedStore(page: import('@playwright/test').Page) {
	test.skip(!colocatedStores, 'The dataset has no colocated stores to disambiguate.');
	await page.setViewportSize({ width: 390, height: 844 });
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.route('https://api.protomaps.com/**', (route) =>
		route.fulfill({ contentType: 'application/x-protobuf', body: '' })
	);
	const first = colocatedStores![0];
	await page.goto(`/?videoid=${first.properties.video_id}`);
	await expect(page.getByText('マップを準備中…')).toBeHidden({ timeout: 30000 });
	await expect(page.getByRole('region', { name: 'お店の詳細' })).toBeVisible();
	await page.waitForTimeout(400);
	await page.getByRole('button', { name: '候補に戻る' }).click();
	await expect(page.getByRole('region', { name: 'お店の候補' })).toBeVisible();
}

async function tapMapCenter(page: import('@playwright/test').Page) {
	const panel = page.getByRole('region', { name: 'お店の候補' });
	const point = await panel.evaluate((element) => ({
		x: (16 + innerWidth - 42) / 2,
		y: (86 + element.getBoundingClientRect().top - 16) / 2
	}));
	await page.mouse.click(point.x, point.y);
}

test('a crowded marker zooms two levels without selecting a store', async ({ page }) => {
	await openColocatedStore(page);
	const initialUrl = page.url();
	await tapMapCenter(page);
	await expect(page).toHaveURL(initialUrl);
	await expect(page.getByRole('region', { name: 'お店の詳細' })).toHaveCount(0);
	await expect(page.getByRole('status')).toHaveCount(0);

	const zoomIn = page.getByRole('button', { name: 'Zoom in', exact: true });
	for (let step = 0; step < 3; step++) await zoomIn.click();
	await expect(zoomIn).toBeDisabled();
});

test('colocated markers remain selectable at max zoom', async ({ page }) => {
	await openColocatedStore(page);
	const zoomIn = page.getByRole('button', { name: 'Zoom in', exact: true });
	for (let step = 0; step < 6; step++) {
		if (await zoomIn.isDisabled()) break;
		await zoomIn.click();
	}
	await expect(zoomIn).toBeDisabled();

	await tapMapCenter(page);
	await expect(page.getByRole('heading', { name: '重なっているお店' })).toBeVisible();
	await expect(page.getByRole('status')).toContainText('拡大しても重なるお店です');
	await expect(page).not.toHaveURL(/videoid=/);

	const rows = page.getByRole('region', { name: 'お店の候補' }).locator('.restaurant-row');
	await expect.poll(() => rows.count()).toBeGreaterThanOrEqual(colocatedStores!.length);
	await rows.first().click();
	await expect(page.getByRole('region', { name: 'お店の詳細' })).toBeVisible();
	await expect(page).toHaveURL(/videoid=/);
});
