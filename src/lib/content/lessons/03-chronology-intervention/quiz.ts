import type { QuizQuestion } from '$lib/types';

export const partNumber = 3;
export const title = 'The Chronology and Purpose of Intervention';
export const slug = 'sbi-framework';
export const objectives = [
	'Understand why the timing of feedback is critical to its effectiveness',
	'Identify the two primary objectives of feedback: redirecting drift and reinforcing success',
	'Recognize the value of real-time, everyday feedback over waiting for formal reviews'
];
export const voicePromptTemplate = `You are Jamie, the podcast host. You just finished explaining the chronology and purpose of intervention with your co-host Alex. Now turn to the learner and have a brief Socratic conversation to check their understanding. Reference their role as a {{user.role}} managing {{user.team_size}} people. Ask them about a recent moment where timely feedback could have shaped an outcome.`;
export const quiz: QuizQuestion[] = [
	{
		type: 'multiple-choice',
		question: 'According to the episode, the real goal of timely feedback is to:',
		options: [
			'React faster when things go wrong',
			'Actively shape outcomes before it\'s too late',
			'Build a record for the annual review',
			'Make sure associates know they\'re being watched'
		],
		correct: 1
	},
	{
		type: 'fill-in-the-blank',
		question:
			'There are two primary objectives for giving feedback: first, to 1. _____ behaviors drifting from expectations, and second, to 2. _____ behaviors that are driving 3. _____.',
		wordBank: ['Redirect', 'Reinforce', 'Success'],
		blanks: ['Redirect', 'Reinforce', 'Success']
	},
	{
		type: 'true-false',
		question:
			'Saving feedback for formal performance reviews creates a culture where feedback feels normal and supportive.',
		correctBool: false,
		explanation:
			'It\'s the opposite! Using everyday, real-time moments is what makes feedback feel normal. Saving it for reviews makes it intimidating.'
	},
	{
		type: 'matching',
		question: 'Match each concept to its benefit.',
		leftItems: ['Real-time feedback', 'Consistent guidance', 'Early acknowledgment of success'],
		rightItems: [
			'Builds an associate\'s confidence and encourages continued excellence.',
			'Learning happens instantly while the moment is still relevant.',
			'Makes accountability easier and evaluations fairer.'
		],
		correctPairs: [1, 2, 0]
	},
	{
		type: 'multiple-choice',
		question:
			'Sam Walton said: "Nothing else can quite substitute for a few well-chosen, well-timed, sincere words of praise. They\'re absolutely free and..."',
		options: [
			'"...expected by every associate."',
			'"...worth a fortune."',
			'"...the key to higher sales."'
		],
		correct: 1
	}
];
