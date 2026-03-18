import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserById, getLessonBySlug } from '$lib/server/db/queries';
import { buildAgentConfig } from '$lib/server/elevenlabs';
import { getLessonContent } from '$lib/content/lesson-data';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.userId) {
		error(401, 'Not authenticated');
	}

	const lessonId = url.searchParams.get('lessonId');
	if (!lessonId) {
		error(400, 'Missing required query parameter: lessonId');
	}

	const user = await getUserById(locals.userId);
	if (!user) {
		error(404, 'User not found');
	}

	const lesson = await getLessonBySlug(lessonId);
	if (!lesson) {
		error(404, 'Lesson not found');
	}

	const content = getLessonContent(lesson.slug);
	const objectives = content?.objectives ?? [];
	const objectivesList = objectives.map((o, i) => `${i + 1}. ${o}`).join('\n');

	let transcriptContext: string;
	let scenarioGreeting: string | undefined;

	if (content?.jamieSystemPrompt) {
		const evalObjectives = content.scenarioEvaluationObjectives ?? objectives;
		const evalList = evalObjectives.map((o, i) => `${i + 1}. ${o}`).join('\n');

		transcriptContext = `MODE: SCENARIO ROLEPLAY

## Character Brief
${content.jamieSystemPrompt}

## Behaviors to Address
The learner must give feedback on ALL of the following. Do not end the conversation until all are covered:
${content.scenarioBriefing ?? ''}

## Evaluation Criteria
${evalList}`;

		scenarioGreeting = content.jamieOpener;
	} else {
		transcriptContext = `MODE: COMPREHENSION CHECK — Assess the learner's understanding through Socratic dialogue. Do not re-teach; probe what they retained.\n\nLesson objectives to assess:\n${objectivesList}\n\nKeep the check to 3-5 exchanges. When satisfied they understand, wrap up naturally.`;
	}

	const agentMode = content?.jamieSystemPrompt ? 'scenario' as const : 'comprehension' as const;

	const config = buildAgentConfig(
		{ title: lesson.title, slug: lesson.slug },
		{
			name: user.name,
			role: user.role,
			teamSize: user.teamSize,
			comfortLevel: user.comfortLevel
		},
		transcriptContext,
		agentMode,
		scenarioGreeting
	);

	return json(config);
};
