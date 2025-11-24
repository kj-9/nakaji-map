// create writeable store
// maplibre map, newFeatures
import { writable, readable, derived } from 'svelte/store';
import geojson from '../../data/app-geojson.json';
import PopupContent from './components/PopupContent.svelte';
import type { ComponentProps } from 'svelte';
import type { Writable } from 'svelte/store';
import type maplibregl from 'maplibre-gl';
import type { Feature, FeatureCollection, Point } from 'geojson';
import { CATEGORIES, resolveCategory } from './category';
import type { Category } from './category';

// writable of maplibre map
export const map: Writable<maplibregl.Map | undefined> = writable();

type PopupProps = ComponentProps<PopupContent>;
type BaseProperties = Omit<PopupProps, 'category'>;

export type FeatureProperties = BaseProperties & { category: Category };

export type FeatureCollectionForPopup = FeatureCollection<Point, FeatureProperties>;
export type BaseFeatureCollection = FeatureCollection<Point, BaseProperties>;

// read-only data of geojson
export const geodata = readable(geojson as BaseFeatureCollection);

// type def for our Properties which extends GeoJsonProperties.
// which has extra props: { name: string; publishedAt: string; title: string; video_id: string; google_maps: string; }
export type FeatureForPopup = Feature<Point, FeatureProperties>;

export const searchQuery = writable('');

export const selectedCategories = writable<Category[]>([...CATEGORIES]);

export const categorizedFeatures = derived(geodata, ($geodata) => {
	return $geodata.features.map((feature) => ({
		...feature,
		properties: {
			...feature.properties,
			category: resolveCategory(feature.properties)
		}
	})) satisfies FeatureForPopup[];
});

export const filteredFeatures = derived(
	[categorizedFeatures, searchQuery, selectedCategories],
	([$categorizedFeatures, $searchQuery, $selectedCategories]) => {
		const query = $searchQuery.trim();
		const normalizedQuery = query.toLowerCase();

		return $categorizedFeatures.filter((feature) => {
			if (!$selectedCategories.includes(feature.properties.category)) return false;

			if (!normalizedQuery) return true;

			const props = feature.properties;
			const values = [props.google_maps, props.name, props.title].filter(
				(value): value is string => !!value
			);

			return values.some((value) => value.toLowerCase().includes(normalizedQuery));
		});
	}
);

export const filteredGeodata = derived(filteredFeatures, ($filteredFeatures) => {
	return {
		type: 'FeatureCollection',
		features: $filteredFeatures
	} satisfies FeatureCollectionForPopup;
});
