import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getProgressForUser, updateLessonProgress } from '$lib/server/db/queries';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.userId) {
		error(401, 'Not authenticated');
	}

	const progress = await getProgressForUser(locals.userId);

	return json(progress);
};

export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.userId) {
		error(401, 'Not authenticated');
	}

	const body = await request.json();
	const { id, ...fields } = body;

	if (!id) {
		error(400, 'Missing required field: id');
	}

	const allowedFields: Record<string, unknown> = {};

	if (fields.status !== undefined) allowedFields.status = fields.status;
	if (fields.comprehensionMode !== undefined) allowedFields.comprehensionMode = fields.comprehensionMode;
	if (fields.comprehensionData !== undefined)
		allowedFields.comprehensionData =
			typeof fields.comprehensionData === 'string'
				? fields.comprehensionData
				: JSON.stringify(fields.comprehensionData);
	if (fields.comprehensionScore !== undefined) allowedFields.comprehensionScore = fields.comprehensionScore;
	if (fields.puzzleEarned !== undefined) allowedFields.puzzleEarned = fields.puzzleEarned;

	const updated = await updateLessonProgress(id, allowedFields);

	if (!updated) {
		error(404, 'Progress record not found');
	}

	return json(updated);
};
