<script lang="ts">
	import { writable } from 'svelte/store';
	import { createSvelteTable, flexRender, getCoreRowModel } from '@tanstack/svelte-table';
	import { geodata } from '$lib/store';
	import { get } from 'svelte/store';
	import { formatDateStr } from '$lib/formatter';
	import { flyTo } from '$lib/components/Popup';

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
				accessorFn: (row: any) => row.properties.google_maps || row.name,
				header: '店名'
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

	const table = createSvelteTable(options) as any; // for now
</script>

<div class="pt-6 overflow-x-auto shadow-md sm:rounded-lg">
	<table class="w-full text-sm text-left rtl:text-right text-gray-500">
		<thead class="text-xs text-gray-700 bg-gray-50">
			{#each $table.getHeaderGroups() as headerGroup}
				<tr>
					{#each headerGroup.headers as header}
						<th scope="col" class="px-6 py-3">
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
						<td class="px-3 py-3" on:click={() => flyTo(cell.row.original)}>
							<svelte:component this={flexRender(cell.column.columnDef.cell, cell.getContext())} />
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
	<div class="h-4" />
</div>
