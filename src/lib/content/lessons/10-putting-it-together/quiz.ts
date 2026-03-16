import type { QuizQuestion } from '$lib/types';

export const partNumber = 10;
export const title = 'Putting It All Together';
export const slug = 'putting-it-together';
export const objectives = ['Apply the complete feedback framework in a practice scenario'];
export const voicePromptTemplate =
	'You are Jordan. Guide the learner through a comprehensive practice scenario.';
export const quiz: QuizQuestion[] = [
	{
		type: 'multiple-choice',
		question: 'What is the correct order for a complete feedback conversation?',
		options: [
			'Impact → Situation → Behavior → Listen → Action',
			'Situation → Behavior → Impact → Listen → Action',
			'Listen → Behavior → Impact → Situation → Action',
			'Action → Situation → Impact → Behavior → Listen'
		],
		correct: 1
	}
];
