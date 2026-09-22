<script lang="ts">
	import { onDestroy } from 'svelte';
	import BottomSheet from '$lib/component/BottomSheet.svelte';
	import Button from '$lib/component/ui/Button.svelte';
	import FluentCheckmark24Regular from '~icons/fluent/checkmark-24-regular';
	import FluentDismiss24Regular from '~icons/fluent/dismiss-24-regular';

	interface Props {
		open: boolean;
		file: File | null;
		onConfirm: (croppedFile: File) => void;
		onCancel: () => void;
	}

	let { open = $bindable(), file, onConfirm, onCancel }: Props = $props();

	let containerEl: HTMLDivElement;
	let imgEl: HTMLImageElement;
	let objectUrl = $state('');
	let naturalWidth = $state(0);
	let naturalHeight = $state(0);

	// Selection rect lives in container-local CSS pixels. The container is
	// sized via aspect-ratio to exactly match the rendered image (object-contain
	// with no letterboxing), so container pixels map 1:1 onto the image.
	let rect = $state({ x: 0, y: 0, w: 0, h: 0 });

	type DragMode = 'move' | 'nw' | 'ne' | 'sw' | 'se' | null;
	let dragMode: DragMode = null;
	let dragStart = { x: 0, y: 0 };
	let rectStart = { x: 0, y: 0, w: 0, h: 0 };

	$effect(() => {
		if (file) {
			const url = URL.createObjectURL(file);
			objectUrl = url;
			naturalWidth = 0;
			naturalHeight = 0;
			rect = { x: 0, y: 0, w: 0, h: 0 };
			return () => URL.revokeObjectURL(url);
		}
		objectUrl = '';
	});

	function handleImageLoad() {
		naturalWidth = imgEl.naturalWidth;
		naturalHeight = imgEl.naturalHeight;
		// Default selection: centered at 80% of the image, Lens-style.
		const cw = containerEl.clientWidth;
		const ch = containerEl.clientHeight;
		const w = cw * 0.8;
		const h = ch * 0.8;
		rect = { x: (cw - w) / 2, y: (ch - h) / 2, w, h };
	}

	const MIN_SIZE = 32;

	function clampRect(r: { x: number; y: number; w: number; h: number }) {
		const cw = containerEl.clientWidth;
		const ch = containerEl.clientHeight;
		const w = Math.min(Math.max(r.w, MIN_SIZE), cw);
		const h = Math.min(Math.max(r.h, MIN_SIZE), ch);
		const x = Math.min(Math.max(r.x, 0), cw - w);
		const y = Math.min(Math.max(r.y, 0), ch - h);
		return { x, y, w, h };
	}

	function startDrag(mode: DragMode, e: PointerEvent) {
		e.preventDefault();
		e.stopPropagation();
		dragMode = mode;
		dragStart = { x: e.clientX, y: e.clientY };
		rectStart = { ...rect };
		window.addEventListener('pointermove', onDrag);
		window.addEventListener('pointerup', endDrag);
	}

	function onDrag(e: PointerEvent) {
		if (!dragMode) return;
		const dx = e.clientX - dragStart.x;
		const dy = e.clientY - dragStart.y;

		if (dragMode === 'move') {
			rect = clampRect({ ...rectStart, x: rectStart.x + dx, y: rectStart.y + dy });
			return;
		}

		let { x, y, w, h } = rectStart;
		if (dragMode.includes('w')) {
			x = rectStart.x + dx;
			w = rectStart.w - dx;
		}
		if (dragMode.includes('e')) {
			w = rectStart.w + dx;
		}
		if (dragMode.includes('n')) {
			y = rectStart.y + dy;
			h = rectStart.h - dy;
		}
		if (dragMode.includes('s')) {
			h = rectStart.h + dy;
		}
		rect = clampRect({ x, y, w, h });
	}

	function endDrag() {
		dragMode = null;
		window.removeEventListener('pointermove', onDrag);
		window.removeEventListener('pointerup', endDrag);
	}

	onDestroy(() => {
		if (typeof window === 'undefined') return;
		window.removeEventListener('pointermove', onDrag);
		window.removeEventListener('pointerup', endDrag);
	});

	async function confirmCrop() {
		if (!file || !containerEl || !naturalWidth) return;
		const cw = containerEl.clientWidth;
		const ch = containerEl.clientHeight;
		const scaleX = naturalWidth / cw;
		const scaleY = naturalHeight / ch;

		const sx = rect.x * scaleX;
		const sy = rect.y * scaleY;
		const sw = rect.w * scaleX;
		const sh = rect.h * scaleY;

		const canvas = document.createElement('canvas');
		canvas.width = Math.round(sw);
		canvas.height = Math.round(sh);
		const ctx = canvas.getContext('2d');
		if (!ctx) return;
		ctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

		// Always re-encode as JPEG regardless of the source format: this is a
		// search query image, not a downloadable artifact, so the lossy
		// compression is a non-issue - and PNG (the canvas default when a
		// source file's type is missing) can run 3-10x larger than JPEG for a
		// photo, which risks tripping the request body size limit serverless
		// hosts (e.g. Vercel) impose on the multipart upload.
		const blob: Blob | null = await new Promise((resolve) =>
			canvas.toBlob(resolve, 'image/jpeg', 0.9)
		);
		if (!blob) return;

		onConfirm(new File([blob], file.name, { type: blob.type }));
	}

	const CORNERS: { id: 'nw' | 'ne' | 'sw' | 'se'; cursor: string }[] = [
		{ id: 'nw', cursor: 'nwse-resize' },
		{ id: 'ne', cursor: 'nesw-resize' },
		{ id: 'sw', cursor: 'nesw-resize' },
		{ id: 'se', cursor: 'nwse-resize' }
	];

	function cornerStyle(id: 'nw' | 'ne' | 'sw' | 'se'): string {
		const left = id === 'nw' || id === 'sw' ? rect.x : rect.x + rect.w;
		const top = id === 'nw' || id === 'ne' ? rect.y : rect.y + rect.h;
		return `left:${left}px; top:${top}px;`;
	}
</script>

<BottomSheet bind:open title="Select search area">
	{#if file}
		<div class="space-y-4">
			<p class="text-base-content/60 text-xs">
				Drag the box over the part of the image you want to search by.
			</p>
			<div
				bind:this={containerEl}
				class="relative mx-auto max-h-[60vh] w-full touch-none overflow-hidden rounded-xl bg-black select-none"
				style="aspect-ratio: {naturalWidth && naturalHeight ? naturalWidth / naturalHeight : 1};"
			>
				<img
					bind:this={imgEl}
					src={objectUrl}
					alt="Selected upload"
					class="pointer-events-none absolute inset-0 h-full w-full object-contain"
					onload={handleImageLoad}
				/>
				{#if rect.w > 0}
					<div
						class="absolute cursor-move border-2 border-white"
						style="left:{rect.x}px; top:{rect.y}px; width:{rect.w}px; height:{rect.h}px; box-shadow: 0 0 0 9999px rgba(0,0,0,0.55);"
						onpointerdown={(e) => startDrag('move', e)}
						role="presentation"
					></div>
					{#each CORNERS as c (c.id)}
						<div
							class="border-primary absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white"
							style="{cornerStyle(c.id)} cursor: {c.cursor};"
							onpointerdown={(e) => startDrag(c.id, e)}
							role="presentation"
						></div>
					{/each}
				{/if}
			</div>

			<div class="flex gap-3">
				<Button variant="subtle" icon={FluentDismiss24Regular} grow onclick={onCancel}
					>Cancel</Button
				>
				<Button variant="primary" icon={FluentCheckmark24Regular} grow onclick={confirmCrop}>
					Use this area
				</Button>
			</div>
		</div>
	{/if}
</BottomSheet>
