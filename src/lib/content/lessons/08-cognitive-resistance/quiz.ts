import type { QuizQuestion } from '$lib/types';

export const partNumber = 8;
export const title = 'Navigating Cognitive Resistance (The 4 Ds)';
export const slug = 'hard-conversations';
export const objectives = ['Deliver constructive feedback with empathy and directness'];
export const voicePromptTemplate =
	'You are Jordan. Discuss delivering difficult feedback with the learner.';
export const quiz: QuizQuestion[] = [
	{
		type: 'multiple-choice',
		question: 'What should you lead with in a hard conversation?',
		options: [
			'A compliment to soften the blow',
			'Clear, direct observation of the behavior',
			'A question about their personal life',
			'A warning about consequences'
		],
		correct: 1
	}
];
