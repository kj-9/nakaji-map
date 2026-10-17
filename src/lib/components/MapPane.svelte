<script lang="ts">
	import 'maplibre-gl/dist/maplibre-gl.css';
	import 'svelte-maplibre-gl/vite';
	import { layers, namedFlavor } from '@protomaps/basemaps';
	import iconURL from '../../asset/icons8-marker-64.png';

	import { map } from '#lib/store.js';
	import type { FeatureForPopup, FeatureCollectionForPopup } from '#lib/store.js';
	import { hasLocation, storeName } from '#lib/discovery.js';
	import type { Bounds } from '#lib/discovery.js';
	import {
		GeoJSONSource,
		ImageLoader,
		MapLibre,
		NavigationControl,
		GeolocateControl,
		SymbolLayer
	} from 'svelte-maplibre-gl';
	import type * as maplibregl from 'maplibre-gl';
	import { createEventDispatcher, onDestroy } from 'svelte';

	export let features: FeatureForPopup[] = [];
	export let selected: FeatureForPopup | undefined = undefined;
	export let panelHeight = 0;
	const dispatch = createEventDispatcher<{ loaded: void; select: FeatureForPopup; area: Bounds }>();
	$: markerData = {
		type: 'FeatureCollection',
		features: features.filter(hasLocation)
	} satisfies FeatureCollectionForPopup;

	const protomapsURL = `https://api.protomaps.com/tiles/v4/{z}/{x}/{y}.mvt?key=${
		import.meta.env.VITE_PROTOMAPS_API_KEY
	}`;

	$: selectedData = {
		type: 'FeatureCollection',
		features:
			selected && hasLocation(selected)
				? [{ ...selected, properties: { ...selected.properties, name: storeName(selected) } }]
				: []
	} satisfies FeatureCollectionForPopup;
	let mapInstance: maplibregl.Map | undefined;
	let ready = false;
	let userMoved = false;

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
		const id = event.features?.[0]?.properties?.video_id;
		const feature = features.find((f) => f.properties.video_id === id);
		if (feature) dispatch('select', feature);
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

	function updateCamera(feature: FeatureForPopup | undefined, height: number) {
		if (!mapInstance || !ready) return;
		const container = mapInstance.getContainer();
		const wide = container.clientWidth >= 768;
		const padding = {
			top: 86,
			right: 42,
			bottom: wide ? 16 : Math.max(0, Math.min(height + 16, container.clientHeight - 110)),
			left: wide && height ? 460 : 16
		};
		if (feature && hasLocation(feature)) {
			const [lng, lat] = feature.geometry.coordinates;
			mapInstance.flyTo({
				center: [lng, lat],
				zoom: Math.max(14, mapInstance.getZoom()),
				padding,
				duration: 500
			});
		} else mapInstance.easeTo({ padding, duration: 0 });
	}
	$: if (ready) updateCamera(selected, panelHeight);

	const markUserMovement = (event: { originalEvent?: unknown }) => {
		if (event.originalEvent) userMoved = true;
	};
	const markDrag = () => {
		userMoved = true;
	};
	const markControl = (event: Event) => {
		if (
			(event.target as HTMLElement).closest(
				'.maplibregl-ctrl-zoom-in,.maplibregl-ctrl-zoom-out,.maplibregl-ctrl-geolocate'
			)
		)
			userMoved = true;
	};
	const publishArea = () => {
		if (!mapInstance || !userMoved) return;
		userMoved = false;
		const container = mapInstance.getContainer();
		const wide = container.clientWidth >= 768;
		const nw = mapInstance.unproject([wide && panelHeight ? 440 : 0, 0]);
		const se = mapInstance.unproject([
			container.clientWidth,
			Math.max(1, container.clientHeight - (wide ? 0 : panelHeight))
		]);
		dispatch('area', [nw.lng, se.lat, se.lng, nw.lat]);
	};
	const handleMapLoad = () => {
		if (!mapInstance) return;
		map.set(mapInstance);
		mapInstance.on('resize', () => updateCamera(selected, panelHeight));
		mapInstance.on('movestart', markUserMovement);
		mapInstance.on('zoomstart', markUserMovement);
		mapInstance.on('dragstart', markDrag);
		mapInstance.on('moveend', publishArea);
		mapInstance.getContainer().addEventListener('click', markControl, true);
		ready = true;
		dispatch('loaded');
	};
	onDestroy(() => {
		mapInstance?.getContainer().removeEventListener('click', markControl, true);
		map.set(undefined);
	});
</script>

<MapLibre
	class="h-full"
	style={baseStyle}
	maxZoom={15.9}
	bind:map={mapInstance}
	onload={handleMapLoad}
>
	<NavigationControl visualizePitch />
	<GeolocateControl
		positionOptions={{
			enableHighAccuracy: false
		}}
		fitBoundsOptions={{ maxZoom: 16 }}
		trackUserLocation={false}
		showUserLocation
	/>

	<ImageLoader images={markerImages}>
		<GeoJSONSource id="places" data={markerData}>
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
		<GeoJSONSource id="selected-store" data={selectedData}>
			<SymbolLayer
				id="selected-store-label"
				layout={{
					'text-field': ['get', 'name'],
					'text-font': ['Noto Sans Regular'],
					'text-size': 13,
					'text-anchor': 'bottom',
					'text-offset': [0, -1.5],
					'text-allow-overlap': true
				}}
				paint={{ 'text-color': '#172134', 'text-halo-color': '#ffffff', 'text-halo-width': 3 }}
			/>
		</GeoJSONSource>
	</ImageLoader>
</MapLibre>
