import { fail } from '@sveltejs/kit';
const actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const image = formData.get('image');
		const startDate = formData.get('startDate')?.toString() || null;
		const endDate = formData.get('endDate')?.toString() || null;
		const tags = formData.get('tags')?.toString() || '';
		if (!image) {
			return fail(400, {
				error: 'No image provided'
			});
		}
		if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
			return fail(400, {
				error: 'End date cannot be before start date'
			});
		}
		try {
			const body = new FormData();
			body.append('image', image);
			if (startDate) body.append('startDate', startDate);
			if (endDate) body.append('endDate', endDate);
			if (tags.trim()) body.append('tags', tags.trim());
			console.log('posting');
			const response = await fetch('http://app:3000/search', {
				method: 'POST',
				body
			});
			console.log('response: ' + JSON.stringify(response));
			if (!response.ok) {
				return fail(400, {
					error: 'Failed to upload image'
				});
			}
			const data = await response.json();
			return {
				success: image.name,
				data
			};
		} catch (error) {
			return fail(500, {
				error: error instanceof Error ? error.message : 'Failed to upload image'
			});
		}
	}
};
export { actions };
