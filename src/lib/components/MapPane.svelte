<script lang="ts">
	import 'maplibre-gl/dist/maplibre-gl.css';
	import 'svelte-maplibre-gl/vite';
	import { layers, namedFlavor } from '@protomaps/basemaps';
	import { markerImage, markerImages } from '#lib/map-markers.js';

	import { map } from '#lib/store.js';
	import type { FeatureForPopup, FeatureProperties } from '#lib/store.js';
	import { hasLocation, storeName } from '#lib/discovery.js';
	import type { Bounds } from '#lib/discovery.js';
	import type { FeatureCollection, Point } from 'geojson';
	type MarkerCollection = FeatureCollection<
		Point,
		FeatureProperties & { marker: string; rank?: number }
	>;
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
	export let panel: HTMLElement | undefined = undefined;
	export let panelOpen = true;
	export let fullScreen = false;
	export let reducedMotion = false;
	const dispatch = createEventDispatcher<{ loaded: void; select: FeatureForPopup; area: Bounds }>();
	$: markerData = {
		type: 'FeatureCollection',
		features: features
			.filter(hasLocation)
			.filter((f) => f !== selected)
			.map((f, rank) => ({
				...f,
				properties: {
					...f.properties,
					name: storeName(f),
					marker: markerImage(f.properties.category),
					rank
				}
			}))
	} satisfies MarkerCollection;

	const protomapsURL = `https://api.protomaps.com/tiles/v4/{z}/{x}/{y}.mvt?key=${
		import.meta.env.VITE_PROTOMAPS_API_KEY
	}`;

	$: selectedData = {
		type: 'FeatureCollection',
		features:
			selected && hasLocation(selected)
				? [
						{
							...selected,
							properties: {
								...selected.properties,
								name: storeName(selected),
								marker: markerImage(selected.properties.category, true)
							}
						}
					]
				: []
	} satisfies MarkerCollection;
	let mapInstance: maplibregl.Map | undefined;
	let ready = false;
	let userMoved = false;

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

	// One frame loop shares the sheet's actual geometry with the camera. It avoids
	// restarting a flyTo on every ResizeObserver update during a CSS transition.
	let frame = 0;
	let syncUntil = 0;
	let lastSelection: FeatureForPopup | undefined;
	let camera: { start: number; from: maplibregl.LngLat; zoom: number; to: number[] } | undefined;
	function syncLayout(
		feature: FeatureForPopup | undefined,
		_height: number,
		_open: boolean,
		_full: boolean,
		reduce: boolean
	) {
		if (!mapInstance || !ready) return;
		if (feature !== lastSelection) {
			lastSelection = feature;
			userMoved = false;
			mapInstance.stop();
			camera =
				feature && hasLocation(feature)
					? {
							start: performance.now(),
							from: mapInstance.getCenter(),
							zoom: mapInstance.getZoom(),
							to: feature.geometry.coordinates
						}
					: undefined;
		}
		syncUntil = performance.now() + (reduce ? 0 : 340);
		if (!frame) frame = requestAnimationFrame(syncFrame);
	}
	function syncFrame(now: number) {
		frame = 0;
		if (!mapInstance || userMoved) {
			camera = undefined;
			return;
		}
		const container = mapInstance.getContainer();
		const wide = container.clientWidth >= 768;
		const rect = panel?.isConnected ? panel.getBoundingClientRect() : undefined;
		const mapRect = container.getBoundingClientRect();
		// Follow the visible edge, including the slide-out transform. Clamp padding
		// while full-screen so the map always retains a nonzero viewport.
		const covered = rect ? Math.max(0, mapRect.bottom - rect.top) : 0;
		const padding = {
			top: Math.min(86, container.clientHeight / 4),
			right: 42,
			bottom: wide ? 16 : Math.min(covered + 16, Math.max(0, container.clientHeight - 110)),
			left:
				wide && rect
					? Math.min(Math.max(16, rect.right - mapRect.left + 20), container.clientWidth - 80)
					: 16
		};
		const options: maplibregl.JumpToOptions = { padding };
		if (camera) {
			const progress = reducedMotion ? 1 : Math.min(1, (now - camera.start) / 340);
			const eased = 1 - Math.pow(1 - progress, 3);
			const delta = ((camera.to[0] - camera.from.lng + 540) % 360) - 180;
			options.center = [
				camera.from.lng + delta * eased,
				camera.from.lat + (camera.to[1] - camera.from.lat) * eased
			];
			options.zoom = camera.zoom + (Math.max(14, camera.zoom) - camera.zoom) * eased;
			if (progress === 1) camera = undefined;
		}
		mapInstance.jumpTo(options, { sheetMotion: true });
		if (!reducedMotion && (now < syncUntil || camera)) frame = requestAnimationFrame(syncFrame);
	}
	$: if (ready) syncLayout(selected, panelHeight, panelOpen, fullScreen, reducedMotion);

	const markUserMovement = (event: { originalEvent?: unknown }) => {
		if (event.originalEvent) {
			userMoved = true;
			camera = undefined;
		}
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
		const visibleHeight = panelOpen && !fullScreen ? panelHeight : 0;
		const nw = mapInstance.unproject([wide && visibleHeight ? 440 : 0, 0]);
		const se = mapInstance.unproject([
			container.clientWidth,
			Math.max(1, container.clientHeight - (wide ? 0 : visibleHeight))
		]);
		dispatch('area', [nw.lng, se.lat, se.lng, nw.lat]);
	};
	const handleMapLoad = () => {
		if (!mapInstance) return;
		map.set(mapInstance);
		mapInstance.on('resize', () =>
			syncLayout(selected, panelHeight, panelOpen, fullScreen, reducedMotion)
		);
		mapInstance.on('movestart', markUserMovement);
		mapInstance.on('zoomstart', markUserMovement);
		mapInstance.on('dragstart', markDrag);
		mapInstance.on('moveend', publishArea);
		mapInstance.getContainer().addEventListener('click', markControl, true);
		ready = true;
		dispatch('loaded');
	};
	onDestroy(() => {
		cancelAnimationFrame(frame);
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
					'icon-allow-overlap': false,
					'icon-image': ['get', 'marker'],
					'icon-size': 0.5,
					'icon-padding': 3,
					'symbol-sort-key': ['get', 'rank'],
					'text-field': ['step', ['zoom'], '', 13, ['get', 'name']],
					'text-font': ['Noto Sans Regular'],
					'text-size': 12,
					'text-max-width': 10,
					'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
					'text-radial-offset': 1.5,
					'text-justify': 'auto',
					'text-padding': 5,
					'text-allow-overlap': false,
					'text-optional': true
				}}
				onclick={handleClick}
				paint={{ 'text-color': '#24354b', 'text-halo-color': '#ffffff', 'text-halo-width': 2 }}
				onmouseenter={handleMouseEnter}
				onmouseleave={handleMouseLeave}
			/>
		</GeoJSONSource>
		<GeoJSONSource id="selected-store" data={selectedData}>
			<SymbolLayer
				id="selected-store-label"
				layout={{
					'icon-image': ['get', 'marker'],
					'icon-size': 0.6,
					'icon-allow-overlap': true,
					'text-field': ['get', 'name'],
					'text-font': ['Noto Sans Regular'],
					'text-size': 13,
					'text-anchor': 'bottom',
					'text-offset': [0, -1.9],
					'text-allow-overlap': true
				}}
				paint={{ 'text-color': '#1953d6', 'text-halo-color': '#ffffff', 'text-halo-width': 3 }}
			/>
		</GeoJSONSource>
	</ImageLoader>
</MapLibre>
