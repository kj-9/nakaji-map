<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { geodata } from '$lib/store';
	import { get } from 'svelte/store';
	import { formatDateStr } from '$lib/formatter';
	import { flyTo } from '$lib/components/Popup';
	import { searchQuery } from '$lib/store';
	import type { FeatureForPopup } from '$lib/store';

	// currently, cannot import '@tanstack/table-core/src/types';
	// so bypass typing and eslint rule for any.
	//import type { ColumnDef, TableOptions } from '@tanstack/table-core/src/types';
	/* eslint-disable @typescript-eslint/no-explicit-any */

	const dispatch = createEventDispatcher();

	const _geodata = get(geodata);
	const defaultData = _geodata.features as FeatureForPopup[];

	const columns = [
		{ header: '店名', key: 'name' },
		{ header: '動画タイトル', key: 'title' },
		{ header: '公開日', key: 'publishedAt' }
	] as const;

	$: filteredData = defaultData.filter((d: any) => {
		const props = d.properties;
		const query = $searchQuery;
		if (!query) return true;

		return (
			props.google_maps?.includes(query) ||
			props.name?.includes(query) ||
			props.title?.includes(query)
		);
	});
</script>

<div class="px-2 sm:px-3 w-full max-w-[760px] bg-white">
	<table
		class="text-xs md:text-sm text-left rtl:text-right text-gray-700 w-full border border-gray-200 rounded-lg shadow-sm bg-white"
		style="word-break: break-word;"
	>
		<thead class="sticky top-0 z-50 bg-white shadow-[0_4px_12px_-2px_rgba(0,0,0,0.2)]">
			<tr>
				<th scope="col" colspan="3" class="px-3 pt-3 pb-2 bg-white">
					<label for="table-search" class="sr-only">Search</label>
					<div class="relative">
						<div class="absolute inset-y-0 left-0 flex items-center ps-3 pointer-events-none">
							<svg
								class="w-4 h-4 text-gray-500"
								aria-hidden="true"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 20 20"
							>
								<path
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
								/>
							</svg>
						</div>
						<input
							bind:value={$searchQuery}
							type="text"
							id="table-search"
							class="pt-2 pb-2 ps-10 text-gray-900 w-full border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
							placeholder="店名で検索"
						/>
					</div>
				</th>
			</tr>
			<tr class="bg-white text-gray-700 border-t border-gray-200">
				{#each columns as column (column.key)}
					<th scope="col" class="px-3 py-2">{column.header}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each filteredData as feature (feature.properties.video_id)}
				<tr class="bg-white border-b last:border-none hover:bg-gray-50">
					{#each columns as column (column.key)}
						<td
							class="px-3 py-2 align-top"
							on:click={() => {
								dispatch('fly');
								flyTo(feature);
							}}
						>
							{#if column.key === 'name'}
								<div class="font-semibold text-gray-900">
									{feature.properties.name || feature.properties.google_maps}
								</div>
								<div class="text-[11px] text-gray-500 break-words">
									{feature.properties.address}
								</div>
							{:else if column.key === 'title'}
								<div class="text-gray-800">{feature.properties.title}</div>
							{:else if column.key === 'publishedAt'}
								{formatDateStr(feature.properties.publishedAt)}
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
			{#if filteredData.length === 0}
				<tr>
					<td colspan={columns.length} class="px-3 py-4 text-center text-gray-500 text-sm">
						一致するお店が見つかりませんでした
					</td>
				</tr>
			{/if}
		</tbody>
	</table>
</div>
