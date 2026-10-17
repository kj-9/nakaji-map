import { describe, expect, it } from 'vitest';
import type { Feature, Point } from 'geojson';
import type { FeatureProperties, FeatureForPopup } from './store';
import { hasLocation, inBounds, matchesChoice } from './discovery';

function feature(
	coordinates: [number, number],
	category: FeatureProperties['category'] = 'ラーメン'
): FeatureForPopup {
	const properties: FeatureProperties = {
		name: 'テスト店',
		publishedAt: '2026-10-01T10:00:00Z',
		title: '紹介動画',
		video_id: 'test-video',
		google_maps: '',
		address: '福岡市',
		category
	};
	return {
		type: 'Feature',
		geometry: { type: 'Point', coordinates },
		properties
	} satisfies Feature<Point, FeatureProperties>;
}

describe('hasLocation', () => {
	it('rejects unknown, non-finite, and out-of-range coordinates', () => {
		expect(hasLocation(feature([0, 0]))).toBe(false);
		expect(hasLocation(feature([Number.NaN, 33.5]))).toBe(false);
		expect(hasLocation(feature([130, Number.NaN]))).toBe(false);
		expect(hasLocation(feature([181, 33.5]))).toBe(false);
		expect(hasLocation(feature([130, 91]))).toBe(false);
	});

	it('accepts valid coordinates on the globe limits', () => {
		expect(hasLocation(feature([-180, -90]))).toBe(true);
		expect(hasLocation(feature([180, 90]))).toBe(true);
	});
});

describe('inBounds', () => {
	it('includes the rectangle edges and excludes points outside or without a location', () => {
		const bounds = [130, 33, 131, 34] as const;
		expect(inBounds(feature([130, 33]), [...bounds])).toBe(true);
		expect(inBounds(feature([131, 34]), [...bounds])).toBe(true);
		expect(inBounds(feature([129.999, 33.5]), [...bounds])).toBe(false);
		expect(inBounds(feature([0, 0]), [...bounds])).toBe(false);
		expect(inBounds(feature([Number.NaN, 33.5]), [...bounds])).toBe(false);
	});

	it('supports a rectangle crossing the international date line', () => {
		const bounds = [170, -10, -170, 10] as const;
		expect(inBounds(feature([179, 0]), [...bounds])).toBe(true);
		expect(inBounds(feature([-179, 0]), [...bounds])).toBe(true);
		expect(inBounds(feature([0, 0.1]), [...bounds])).toBe(false);
	});
});

describe('matchesChoice', () => {
	it('groups the four meat categories while preserving specific category matching', () => {
		for (const category of ['焼肉', 'ステーキ/ハンバーグ', 'とんかつ', '焼き鳥'] as const) {
			expect(matchesChoice(feature([130, 33], category), '肉')).toBe(true);
		}
		expect(matchesChoice(feature([130, 33], 'ラーメン'), '肉')).toBe(false);
		expect(matchesChoice(feature([130, 33], 'とんかつ'), 'ラーメン')).toBe(false);
		expect(matchesChoice(feature([130, 33], 'ラーメン'), 'すべて')).toBe(true);
	});
});
