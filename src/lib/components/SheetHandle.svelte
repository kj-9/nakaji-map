<script lang="ts">
	export let mode: 'map' | 'split' | 'full';
	// eslint-disable-next-line no-unused-vars -- Typed callback signature, not a runtime parameter.
	export let onmodechange: (mode: 'map' | 'split' | 'full') => void;
	let start: { x: number; y: number; id: number } | undefined;
	let ignoreClickUntil = 0;
	$: label = mode === 'map' ? 'お店を見る' : mode === 'split' ? 'お店を全画面に' : '地図を広く見る';
	const modes = ['map', 'split', 'full'] as const;
	function step(direction: number) {
		onmodechange(modes[Math.max(0, Math.min(2, modes.indexOf(mode) + direction))]);
	}
	function pointerdown(event: PointerEvent) {
		if (!event.isPrimary || event.button !== 0) return;
		ignoreClickUntil = 0;
		start = { x: event.clientX, y: event.clientY, id: event.pointerId };
		(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
	}
	function pointerup(event: PointerEvent) {
		if (!start || event.pointerId !== start.id) return;
		const dx = event.clientX - start.x;
		const dy = event.clientY - start.y;
		start = undefined;
		if (Math.hypot(dx, dy) > 10) ignoreClickUntil = performance.now() + 400;
		if (Math.abs(dy) >= 32 && Math.abs(dy) > Math.abs(dx) * 1.2) step(dy < 0 ? 1 : -1);
	}
	function keydown(event: KeyboardEvent) {
		if (!['ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
		event.preventDefault();
		if (event.key === 'Home') onmodechange('map');
		else if (event.key === 'End') onmodechange('full');
		else step(event.key === 'ArrowUp' ? 1 : -1);
	}
</script>

<button
	type="button"
	class="sheet-handle"
	aria-label={label}
	aria-expanded={mode !== 'map'}
	aria-describedby={`sheet-handle-help-${mode}`}
	onpointerdown={pointerdown}
	onpointerup={pointerup}
	onpointercancel={() => (start = undefined)}
	onkeydown={keydown}
	onclick={(event) => {
		if (event.detail > 0 && performance.now() < ignoreClickUntil) return;
		onmodechange(mode === 'full' ? 'map' : mode === 'map' ? 'split' : 'full');
	}}
	><span aria-hidden="true"></span><span id={`sheet-handle-help-${mode}`} class="sr-only"
		>上下にスワイプ、または上下の矢印キーで表示を切り替えられます</span
	></button
>

<style>
	.sheet-handle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		min-height: 44px;
		flex-shrink: 0;
		border: 0;
		background: transparent;
		cursor: ns-resize;
		touch-action: none;
		user-select: none;
	}
	.sheet-handle > span[aria-hidden] {
		width: 44px;
		height: 5px;
		border-radius: 3px;
		background: #7b899b;
	}
	.sheet-handle:hover > span[aria-hidden] {
		background: #526279;
	}
	.sheet-handle:active > span[aria-hidden] {
		background: #2464ff;
	}
	.sheet-handle:focus-visible {
		outline-offset: -5px;
	}
</style>
