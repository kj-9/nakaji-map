<script lang="ts">
	import 'maplibre-gl/dist/maplibre-gl.css';
	import layers from 'protomaps-themes-base';
	import iconURL from '../../asset/icons8-marker-64.png';

	import { geodata, map } from '$lib/store';
	import type { FeatureForPopup } from '$lib/store';
	import { createPopupAndPushState, instanceOfFeatureForPopup, flyTo } from './Popup';
	import {
		GeoJSONSource,
		ImageLoader,
		Map,
		NavigationControl,
		FullScreenControl,
		GeolocateControl,
		SymbolLayer
	} from 'svelte-maplibre-gl';
	import type maplibregl from 'maplibre-gl';

	export let initialFlyFeature: FeatureForPopup;

	const protomapsURL = `https://api.protomaps.com/tiles/v3/{z}/{x}/{y}.pbf?key=${
		import.meta.env.VITE_PROTOMAPS_API_KEY
	}`;

	let mapInstance: maplibregl.Map | undefined;
	let hasFlownToInitial = false;

	const markerImages = {
		'location-marker': iconURL
	};

	const baseStyle: maplibregl.StyleSpecification = {
		version: 8,
		glyphs: 'https://cdn.protomaps.com/fonts/pbf/{fontstack}/{range}.pbf',
		sources: {
			protomaps: {
				type: 'vector',
				tiles: [protomapsURL],
				attribution:
					'<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'
			}
		},
		layers: layers('protomaps', 'light'),
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
		mapInstance?.getCanvas().style && (mapInstance.getCanvas().style.cursor = 'pointer');
	};

	const handleMouseLeave = () => {
		mapInstance?.getCanvas().style && (mapInstance.getCanvas().style.cursor = '');
	};

	const handleMapLoad = () => {
		if (!mapInstance) return;

		map.set(mapInstance);

		if (initialFlyFeature && !hasFlownToInitial) {
			hasFlownToInitial = true;
			flyTo(initialFlyFeature);
		}
	};

	$: if (mapInstance && initialFlyFeature && !hasFlownToInitial) {
		hasFlownToInitial = true;
		flyTo(initialFlyFeature);
	}
</script>

<Map
	class="h-screen"
	style={baseStyle}
	maxZoom={15.9}
	autoloadGlobalCss={false}
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
		<GeoJSONSource id="places" data={$geodata}>
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
</Map>
