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
