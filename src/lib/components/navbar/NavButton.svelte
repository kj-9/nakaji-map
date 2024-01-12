<script>
	export let active = false;
	export let label = '';
</script>

<li class="{active ? 'bg-gray-50' : ''}  rounded p-1">
	<button
		on:click|stopPropagation={() => (active = !active)}
		class="flex items-center justify-between hover:text-blue-700"
		>{label}
		<svg
			class="w-2.5 h-2.5 ms-2.5"
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 10 6"
		>
			<path
				stroke="currentColor"
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="m1 1 4 4 4-4"
			/>
		</svg></button
	>
</li>
