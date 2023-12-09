// create writeable store
// maplibre map, newFeatures
import { writable } from 'svelte/store';

// declare store type, which is writable of maplibre map

/** @type {import('svelte/store').Writable<maplibregl.Map>} */
export const map = writable();
