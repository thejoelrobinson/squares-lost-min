import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserById, createUser } from '$lib/server/db/queries';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.userId) {
		error(404, 'No user found');
	}

	const user = await getUserById(locals.userId);

	if (!user) {
		error(404, 'User not found');
	}

	return json(user);
};

export const POST: RequestHandler = async ({ request }) => {
	const body = await request.json();

	const { name, role, teamSize, feedbackFrequency, comfortLevel, challenges, scenario } = body;

	if (!name || !role || teamSize == null || !feedbackFrequency || comfortLevel == null) {
		error(400, 'Missing required fields: name, role, teamSize, feedbackFrequency, comfortLevel');
	}

	const user = await createUser({
		name,
		role,
		teamSize,
		feedbackFrequency,
		comfortLevel,
		challenges: JSON.stringify(challenges ?? []),
		scenario: scenario ?? null
	});

	return json(user, { status: 201 });
};
