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

<div class="px-2 h-screen" style="width:80vw">
	<table
		class="text-xs md:text-sm text-left rtl:text-right text-gray-500 w-full"
		style="word-break: break-word;"
	>
		<thead class="sticky top-0 bg-gray-50">
			<tr>
				<th scope="col" colspan="3">
					<label for="table-search" class="sr-only">Search</label>
					<div class="relative">
						<form class="mt-2 text-right" method="dialog">
							<button
								type="submit"
								class="bg-white rounded-md inline-flex items-center justify-center text-gray-400 hover:text-gray-800 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
							>
								<span class="sr-only">Close menu</span>
								<!-- Heroicon name: outline/x -->
								<svg
									class="h-6 w-6"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</form>
						<div
							class="mt-7 absolute inset-y-0 rtl:inset-r-0 flex items-center ps-3 pointer-events-none"
						>
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
			<tr>
				{#each columns as column}
					<th scope="col" class="px-6 py-3 text-gray-700">{column.header}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each filteredData as feature}
				<tr class="bg-white border-b hover:bg-gray-50">
					{#each columns as column}
						<td
							class="px-1 py-2"
							on:click={() => {
								dispatch('fly');
								flyTo(feature);
							}}
						>
							{#if column.key === 'name'}
								{feature.properties.name || feature.properties.google_maps}
							{:else if column.key === 'title'}
								{feature.properties.title}
							{:else if column.key === 'publishedAt'}
								{formatDateStr(feature.properties.publishedAt)}
							{/if}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
