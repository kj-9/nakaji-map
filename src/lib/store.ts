// create writeable store
// maplibre map, newFeatures
import { writable, readable } from 'svelte/store';
import geojson from '../../data/app-geojson.json';
import PopupContent from './components/PopupContent.svelte';
import type { ComponentProps } from 'svelte';
import type { Writable, Readable } from 'svelte/store';

// writable of maplibre map
export const map: Writable<maplibregl.Map> = writable();

// read-only data of geojson
export const geodata = readable(geojson) as Readable<
	GeoJSON.FeatureCollection<GeoJSON.Point, ComponentProps<PopupContent>>
>;

// type def for our Properties which extends GeoJsonProperties.
// which has extra props: { name: string; publishedAt: string; title: string; video_id: string; google_maps: string; }
export interface FeatureForPopup
	extends GeoJSON.Feature<GeoJSON.Point, ComponentProps<PopupContent>> {}

export const searchQuery = writable('');
