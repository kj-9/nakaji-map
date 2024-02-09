<!-- see https://www.youtube.com/watch?v=RT0aemVpvVE -->
{#await Promise.resolve()}
	<slot name="fallback" />
{:then}
	<slot />
{/await}
