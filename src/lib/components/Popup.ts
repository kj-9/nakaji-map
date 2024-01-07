import { Popup } from '$lib/maplibreGL';
import PopupContent from './PopupContent.svelte';
import type { ComponentProps } from 'svelte';

export const createPopup = (
	coordinates: GeoJSON.Position,
	popupContentProps: ComponentProps<PopupContent>
) => {
	const container = document.createElement('div');
	new PopupContent({
		target: container,
		props: popupContentProps
	});

	// type check coodinates is [number, number]
	const [lng, lat] = coordinates;
	return new Popup().setLngLat([lng, lat]).setDOMContent(container);
};

// type def for our Properties which extends GeoJsonProperties.
// which has extra props: { name: string; publishedAt: string; title: string; video_id: string; google_maps: string; }
export interface FeatureForPopup
	extends GeoJSON.Feature<GeoJSON.Point, ComponentProps<PopupContent>> {}

// todo: not perfect type gaurds
export function instanceOfFeatureForPopup(obj: object): obj is FeatureForPopup {
	// check if object has properties

	if (!('properties' in obj)) return false;

	// check if object has geometry
	if (!('geometry' in obj)) return false;

	return true;
}
