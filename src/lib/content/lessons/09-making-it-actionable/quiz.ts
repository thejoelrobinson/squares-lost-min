import type { QuizQuestion } from '$lib/types';

export const partNumber = 9;
export const title = 'Making It Actionable';
export const slug = 'making-it-actionable';
export const objectives = ['Turn feedback into concrete next steps'];
export const voicePromptTemplate =
	'You are Jordan. Discuss making feedback actionable with the learner.';
export const quiz: QuizQuestion[] = [
	{
		type: 'multiple-choice',
		question: 'What makes feedback actionable?',
		options: [
			'Specific next steps with a timeline',
			'A detailed written report',
			'A follow-up meeting scheduled',
			'All of the above'
		],
		correct: 0
	}
];
