<script lang="ts">
	export let mode: 'map' | 'split' | 'full';
	// eslint-disable-next-line no-unused-vars -- Typed callback signature, not a runtime parameter.
	export let onmodechange: (mode: 'map' | 'split' | 'full') => void;
	export let splitRatio = 0.54;
	// eslint-disable-next-line no-unused-vars -- Typed callback signature.
	export let ondrag: (height: number | null) => void;
	let start:
		| {
				y: number;
				height: number;
				id: number;
				lastY: number;
				time: number;
				velocity: number;
				moved: boolean;
				points: number[];
		  }
		| undefined;
	$: label = mode === 'map' ? 'お店を見る' : mode === 'split' ? 'お店を全画面に' : '地図を広く見る';
	const modes = ['map', 'split', 'full'] as const;
	function step(direction: number) {
		onmodechange(modes[Math.max(0, Math.min(2, modes.indexOf(mode) + direction))]);
	}
	function pointerdown(event: PointerEvent) {
		if (!event.isPrimary || event.button !== 0) return;
		const handle = event.currentTarget as HTMLElement;
		const panel = handle.closest('.discovery-panel')!;
		const root = handle.closest('.discovery-app')!;
		const height = root.clientHeight;
		const wide = root.clientWidth >= 768;
		const safe =
			Number.parseFloat(getComputedStyle(root).getPropertyValue('--sheet-safe-bottom')) || 0;
		const split = wide ? height - 104 : height * (height <= 500 ? 0.68 : splitRatio);
		start = {
			y: event.clientY,
			height: panel.getBoundingClientRect().height,
			id: event.pointerId,
			lastY: event.clientY,
			time: event.timeStamp,
			velocity: 0,
			moved: false,
			points: [44 + safe, split, height]
		};
		handle.setPointerCapture(event.pointerId);
	}
	function pointermove(event: PointerEvent) {
		if (!start || event.pointerId !== start.id) return;
		const delta = start.y - event.clientY;
		if (!start.moved && Math.abs(delta) < 6) return;
		start.moved = true;
		const dt = event.timeStamp - start.time;
		if (dt > 0) start.velocity = (start.lastY - event.clientY) / dt;
		start.lastY = event.clientY;
		start.time = event.timeStamp;
		ondrag(Math.max(start.points[0], Math.min(start.points[2], start.height + delta)));
	}
	function finish(event: PointerEvent, cancelled = false) {
		if (!start || event.pointerId !== start.id) return;
		const drag = start;
		start = undefined;
		if (!drag.moved) return;
		const height = Math.max(
			drag.points[0],
			Math.min(drag.points[2], drag.height + drag.y - event.clientY)
		);
		const velocity = event.timeStamp - drag.time < 100 ? drag.velocity : 0;
		const projected = height + Math.max(-1.5, Math.min(1.5, velocity)) * 160;
		const target = cancelled
			? mode
			: modes[
					drag.points.reduce(
						(best, point, index) =>
							Math.abs(point - projected) < Math.abs(drag.points[best] - projected) ? index : best,
						0
					)
				];
		onmodechange(target);
		ondrag(null);
	}

	function keydown(event: KeyboardEvent) {
		if (!['ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', ' '].includes(event.key)) return;
		event.preventDefault();
		if (event.key === 'Enter' || event.key === ' ') {
			onmodechange(mode === 'full' ? 'split' : mode === 'split' ? 'full' : 'split');
		} else if (event.key === 'Home') onmodechange('map');
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
	onpointermove={pointermove}
	onpointerup={(event) => finish(event)}
	onpointercancel={(event) => finish(event, true)}
	onkeydown={keydown}
	onclick={(event) => {
		// Assistive activation has no pointer click count; ordinary taps do nothing.
		if (event.detail === 0)
			onmodechange(mode === 'full' ? 'split' : mode === 'split' ? 'full' : 'split');
	}}
	><span aria-hidden="true"></span><span id={`sheet-handle-help-${mode}`} class="sr-only"
		>上下にドラッグ、または上下の矢印キーで表示を切り替えられます</span
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
