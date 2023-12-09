<script>
	import Map from '$lib/components/MapPane.svelte';
	import NavBar from '$lib/components/navbar/NavBar.svelte';
</script>

<svelte:head>
	<title>中島浩二チャンネルマップ</title>
	<meta name="description" content="中島浩二チャンネルマップ(ファンサイト)" />
</svelte:head>

<div class="relative">
	<Map />

	<div class="absolute top-5 left-5">
		<NavBar />
	</div>
</div>
