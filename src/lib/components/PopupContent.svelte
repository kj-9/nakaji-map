<script lang="ts">
	export let name: string;
	export let publishedAt: string;
	export let title: string;
	export let video_id: string;
	export let google_maps: string;

	const gmapURL = encodeURI(`https://www.google.com/maps/search/${google_maps}`);
	const videoURL = `https://www.youtube.com/watch?v=${video_id}`;

	const date = new Date(publishedAt).toLocaleDateString('ja-JP', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});

</script>

<div class="rounded-lg text-sm">
	<div class="mb-2">
		<h2 class="font-bold">{name}</h2>
		<span class="text-gray-500">{date}</span>
	</div>
	<p>{title}</p>
	<ul class="text-xs">
		<li><a href={videoURL} target="_blank">Watch on YouTube</a></li>
		<li><a href={gmapURL} target="_blank">Open in Google Maps</a></li>
		<li>
			<a
				href="https://www.flaticon.com/free-icons/pin"
				class="text-gray-300 text-xs"
				title="pin icons">Pin icons created by Freepik - Flaticon</a
			>
		</li>
	</ul>
	<form method="POST" action="/">
		<button type="submit">submit</button>
	  </form>
</div>
