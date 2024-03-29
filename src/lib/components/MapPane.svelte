<script lang="ts">
	import 'maplibre-gl/dist/maplibre-gl.css';
	import layers from 'protomaps-themes-base';
	import iconURL from '../../asset/icons8-marker-64.png';

	import { get } from 'svelte/store';
	import { map, geodata } from '$lib/store';
	import type { FeatureForPopup } from '$lib/store';
	import { Map, NavigationControl, GeolocateControl, FullscreenControl } from '$lib/maplibreGL';
	import { createPopupAndPushState, instanceOfFeatureForPopup, flyTo } from './Popup';

	export let initialFlyFeature: FeatureForPopup;

	const protomapsURL = `https://api.protomaps.com/tiles/v3/{z}/{x}/{y}.pbf?key=${
		import.meta.env.VITE_PROTOMAPS_API_KEY
	}`;

	function mapMount(node: HTMLElement, initialFlyFeature: FeatureForPopup) {
		const _map = new Map({
			container: node,
			maxZoom: 15.9, // for current protomap api
			style: {
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
			}
		});

		_map.addControl(
			new NavigationControl({
				visualizePitch: true
			})
		);
		_map.addControl(new FullscreenControl());
		// 現在位置表示
		_map.addControl(
			new GeolocateControl({
				positionOptions: {
					enableHighAccuracy: false
				},
				fitBoundsOptions: { maxZoom: 16 },
				trackUserLocation: true,
				showUserLocation: true
			})
		);

		async function onLoadMap() {
			const response = await _map.loadImage(iconURL);

			// guard for image
			if (!response.data) {
				throw new Error('image is null');
			}

			// set marker image
			_map.addImage('location-marker', response.data);

			// Add a GeoJSON source
			_map.addSource('places', {
				type: 'geojson',
				data: get(geodata)
			});

			// Add a layer showing the places.
			_map.addLayer({
				id: 'places',
				type: 'symbol',
				source: 'places',
				layout: {
					'icon-allow-overlap': true,
					'icon-image': 'location-marker',
					'icon-size': 0.3
				}
			});

			// When a click event occurs on a feature in the places layer, open a popup at the
			// location of the feature, with description HTML from its properties.
			_map.on('click', 'places', (e) => {
				// ensure e has features
				if (!e.features) {
					console.debug('event object does not have `features` property');
					return;
				}

				const feature = e.features[0];

				// ensure feature is Feature
				if (!instanceOfFeatureForPopup(feature)) {
					console.debug('feature is not Feature');
					return;
				}

				const coordinates = feature.geometry.coordinates;

				// Ensure that if the map is zoomed out such that multiple
				// copies of the feature are visible, the popup appears
				// over the copy being pointed to.
				while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
					coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
				}

				const popup = createPopupAndPushState(coordinates, feature.properties);

				popup.addTo(_map);
			});

			// Change the cursor to a pointer when the mouse is over the places layer.
			_map.on('mouseenter', 'places', () => {
				_map.getCanvas().style.cursor = 'pointer';
			});

			// Change it back to a pointer when it leaves.
			_map.on('mouseleave', 'places', () => {
				_map.getCanvas().style.cursor = '';
			});

			map.set(_map);

			// fly to initial feature here
			// onMount is too early, `map` store is not set yet
			if (initialFlyFeature) {
				// sleep 3sec
				flyTo(initialFlyFeature);
			}
		}

		// Add a layer showing the places.
		_map.on('load', () => {
			onLoadMap();
		});
	}
</script>

<div class="h-screen" use:mapMount={initialFlyFeature} />
