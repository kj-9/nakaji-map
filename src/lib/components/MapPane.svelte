<script lang="ts">
	import 'maplibre-gl/dist/maplibre-gl.css';
	import 'svelte-maplibre-gl/vite';
	import { layers, namedFlavor } from '@protomaps/basemaps';
	import iconURL from '../../asset/icons8-marker-64.png';

	import { filteredGeodata, map } from '#lib/store.js';
	import type { FeatureForPopup } from '#lib/store.js';
	import { createPopupAndPushState, instanceOfFeatureForPopup, flyTo } from './Popup.js';
	import {
		GeoJSONSource,
		ImageLoader,
		MapLibre,
		NavigationControl,
		FullScreenControl,
		GeolocateControl,
		SymbolLayer
	} from 'svelte-maplibre-gl';
	import type * as maplibregl from 'maplibre-gl';
	import { createEventDispatcher } from 'svelte';

	export let initialFlyFeature: FeatureForPopup | undefined;
	const dispatch = createEventDispatcher<{ loaded: void }>();

	const protomapsURL = `https://api.protomaps.com/tiles/v4/{z}/{x}/{y}.mvt?key=${
		import.meta.env.VITE_PROTOMAPS_API_KEY
	}`;

	let mapInstance: maplibregl.Map | undefined;
	let hasFlownToInitial = false;

	const markerImages = {
		'location-marker': iconURL
	};

	const baseStyle: maplibregl.StyleSpecification = {
		version: 8,
		glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
		sprite: 'https://protomaps.github.io/basemaps-assets/sprites/v4/light',
		sources: {
			protomaps: {
				type: 'vector',
				tiles: [protomapsURL],
				maxzoom: 15,
				attribution:
					'<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'
			}
		},
		layers: layers('protomaps', namedFlavor('light'), { lang: 'ja' }),
		center: [130.398, 33.591],
		zoom: 13
	};

	const handleClick = (event: maplibregl.MapLayerMouseEvent) => {
		if (!event.features) {
			console.debug('event object does not have `features` property');
			return;
		}

		const feature = event.features[0];

		if (!instanceOfFeatureForPopup(feature)) {
			console.debug('feature is not Feature');
			return;
		}

		const coordinates = feature.geometry.coordinates;

		while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
			coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360;
		}

		const popup = createPopupAndPushState(coordinates, feature.properties);

		if (!mapInstance) {
			console.error('map is not ready');
			return;
		}

		popup.addTo(mapInstance);
	};

	const handleMouseEnter = () => {
		const canvas = mapInstance?.getCanvas();
		if (canvas?.style) {
			canvas.style.cursor = 'pointer';
		}
	};

	const handleMouseLeave = () => {
		const canvas = mapInstance?.getCanvas();
		if (canvas?.style) {
			canvas.style.cursor = '';
		}
	};

	const handleMapLoad = () => {
		if (!mapInstance) return;

		map.set(mapInstance);
		dispatch('loaded');

		if (initialFlyFeature && !hasFlownToInitial) {
			hasFlownToInitial = true;
			flyTo(initialFlyFeature);
		}
	};
</script>

<MapLibre
	class="h-full"
	style={baseStyle}
	maxZoom={15.9}
	bind:map={mapInstance}
	onload={handleMapLoad}
>
	<NavigationControl visualizePitch />
	<FullScreenControl />
	<GeolocateControl
		positionOptions={{
			enableHighAccuracy: false
		}}
		fitBoundsOptions={{ maxZoom: 16 }}
		trackUserLocation
		showUserLocation
	/>

	<ImageLoader images={markerImages}>
		<GeoJSONSource id="places" data={$filteredGeodata}>
			<SymbolLayer
				id="places"
				layout={{
					'icon-allow-overlap': true,
					'icon-image': 'location-marker',
					'icon-size': 0.3
				}}
				onclick={handleClick}
				onmouseenter={handleMouseEnter}
				onmouseleave={handleMouseLeave}
			/>
		</GeoJSONSource>
	</ImageLoader>
</MapLibre>
