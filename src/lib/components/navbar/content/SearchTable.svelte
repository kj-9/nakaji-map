<script lang="ts">
	import { writable } from 'svelte/store';
	import { createSvelteTable, flexRender, getCoreRowModel } from '@tanstack/svelte-table';
	import { geodata } from '$lib/store';
	import { get } from 'svelte/store';
	import { formatDateStr } from '$lib/formatter';
	import { flyTo } from '$lib/components/Popup';
	import { searchQuery } from '$lib/store';

	// currently, cannot import '@tanstack/table-core/src/types';
	// so bypass typing and eslint rule for any.
	//import type { ColumnDef, TableOptions } from '@tanstack/table-core/src/types';
	/* eslint-disable @typescript-eslint/no-explicit-any */

	const _geodata = get(geodata);
	type Feature = {
		properties: {
			//video_id: string
			name: string;
			//version: string
			address: string;
			//open_location_code: string
			//url: string
			//needs_to_verify: string
			google_maps: string;
			//error: string
			//title: string;
			publishedAt: string;
		};
	};

	const defaultData: Feature[] = _geodata.features;

	const defaultColumns =
		//: ColumnDef<Feature>[]
		[
			{
				accessorFn: (row: any) => row.properties.google_maps || row.properties.name,
				header: '店名'
			},
			{
				accessorFn: (row: any) => row.properties.title,
				header: '動画タイトル'
			},
			{
				accessorFn: (row: any) => formatDateStr(row.properties.publishedAt),
				header: '公開日'
			}
		];

	const options = writable({
		//<TableOptions<Feature>>({
		data: defaultData,
		columns: defaultColumns,
		getCoreRowModel: getCoreRowModel()
	});

	$: {
		options.update((o) => {
			const newData = defaultData.filter((d: any) => {
				const name = d.properties.google_maps || d.properties.name;
				return name.includes($searchQuery);
			});
			return {
				...o,
				data: newData
			};
		});
	}

	const table = createSvelteTable(options) as any; // for now
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
						<form class="mt-3" method="dialog">
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
			{#each $table.getHeaderGroups() as headerGroup}
				<tr>
					{#each headerGroup.headers as header}
						<th scope="col" class="px-6 py-3 text-gray-700">
							{#if !header.isPlaceholder}
								<svelte:component
									this={flexRender(header.column.columnDef.header, header.getContext())}
								/>
							{/if}
						</th>
					{/each}
				</tr>
			{/each}
		</thead>
		<tbody>
			{#each $table.getRowModel().rows as row}
				<tr class="bg-white border-b hover:bg-gray-50">
					{#each row.getVisibleCells() as cell}
						<td class="px-1 py-2" on:click={() => flyTo(cell.row.original)}>
							<svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())} />
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
