<script lang="ts">
	interface Props {
		startDate: Date | undefined;
		endDate: Date | undefined;
	}

	let { startDate = $bindable(), endDate = $bindable() }: Props = $props();

	// Native date inputs speak yyyy-mm-dd strings; the form schema speaks Date.
	function toInputValue(date: Date | undefined): string {
		return date ? date.toISOString().slice(0, 10) : '';
	}

	function fromInputValue(value: string): Date | undefined {
		return value ? new Date(value) : undefined;
	}
</script>

<div class="flex min-w-0 gap-1.5">
	<div class="relative min-w-0 flex-1">
		<input
			type="date"
			value={toInputValue(startDate)}
			oninput={(e) => (startDate = fromInputValue(e.currentTarget.value))}
			name="startDate"
			title="From"
			class="field-control w-full min-w-0 rounded-full px-3 py-2 text-xs {startDate
				? ''
				: 'text-transparent'}"
		/>
		{#if !startDate}
			<span
				class="text-base-content/60 pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs"
			>
				From
			</span>
		{/if}
	</div>
	<div class="relative min-w-0 flex-1">
		<input
			type="date"
			value={toInputValue(endDate)}
			oninput={(e) => (endDate = fromInputValue(e.currentTarget.value))}
			name="endDate"
			title="Until"
			class="field-control w-full min-w-0 rounded-full px-3 py-2 text-xs {endDate
				? ''
				: 'text-transparent'}"
		/>
		{#if !endDate}
			<span
				class="text-base-content/60 pointer-events-none absolute inset-y-0 left-3 flex items-center text-xs"
			>
				Until
			</span>
		{/if}
	</div>
</div>
