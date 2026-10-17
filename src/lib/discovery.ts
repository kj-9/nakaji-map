import type { FeatureForPopup } from './store';
import type { Category } from './category';

export type Bounds = [west: number, south: number, east: number, north: number];
export type FoodChoice = Category | 'すべて' | '肉';
export const meatCategories: Category[] = ['焼肉', 'ステーキ/ハンバーグ', 'とんかつ', '焼き鳥'];
export function hasLocation(feature: FeatureForPopup) {
	const [lng, lat] = feature.geometry.coordinates;
	return (
		Number.isFinite(lng) &&
		Number.isFinite(lat) &&
		Math.abs(lng) <= 180 &&
		Math.abs(lat) <= 90 &&
		(lng !== 0 || lat !== 0)
	);
}
export function inBounds(feature: FeatureForPopup, bounds: Bounds) {
	if (!hasLocation(feature)) return false;
	const [lng, lat] = feature.geometry.coordinates;
	const [west, south, east, north] = bounds;
	return (
		lat >= south &&
		lat <= north &&
		(west <= east ? lng >= west && lng <= east : lng >= west || lng <= east)
	);
}
export function matchesChoice(feature: FeatureForPopup, choice: FoodChoice) {
	return (
		choice === 'すべて' ||
		(choice === '肉'
			? meatCategories.includes(feature.properties.category)
			: feature.properties.category === choice)
	);
}
export function storeName(feature: FeatureForPopup) {
	return (
		feature.properties.name ||
		feature.properties.google_maps ||
		feature.properties.address ||
		'紹介されたお店'
	);
}
