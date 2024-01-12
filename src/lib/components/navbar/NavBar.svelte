<script lang="ts">
	import About from '$lib/components/navbar/content/About.svelte';
	import News from '$lib/components/navbar/content/News.svelte';
	import SearchTable from '$lib/components/navbar/content/SearchTable.svelte';
	import Modal from '$lib/components/navbar/Modal.svelte';
	import NavButton from './NavButton.svelte';

	export let showAbout = true; // show 'about' from start
	let showNews = false;
	let showSearch = false;
</script>

<Modal bind:showModal={showAbout}>
	<About />
</Modal>

<Modal bind:showModal={showNews}>
	<News />
</Modal>
<Modal bind:showModal={showSearch}>
	<SearchTable />
</Modal>

<nav>
	<div class="flex flex-wrap justify-between items-center">
		<div id="mega-menu-full" class="items-center justify-between font-medium">
			<ul class="flex space-x-8 flex-row">
				<NavButton bind:active={showAbout} label="About" />
				<NavButton bind:active={showNews} label="News" />
				<NavButton bind:active={showSearch} label="Search" />
			</ul>
		</div>
	</div>
</nav>
