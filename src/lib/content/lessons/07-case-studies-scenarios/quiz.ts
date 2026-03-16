import type { QuizQuestion } from '$lib/types';

export const partNumber = 7;
export const title = 'Real-World Case Studies and Scenarios';
export const slug = 'being-specific';
export const objectives = ['Use concrete observations instead of vague judgments'];
export const voicePromptTemplate =
	'You are Jordan. Discuss specificity in feedback with the learner.';
export const quiz: QuizQuestion[] = [
	{
		type: 'multiple-choice',
		question: 'Which is an example of specific feedback?',
		options: [
			'"You need to do better"',
			'"Your report on Tuesday had three data errors in section 2"',
			'"You\'re not a team player"',
			'"Good job lately"'
		],
		correct: 1
	}
];
