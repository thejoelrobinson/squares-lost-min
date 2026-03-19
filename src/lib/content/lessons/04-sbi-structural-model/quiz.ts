import type { QuizQuestion } from '$lib/types';

export const partNumber = 4;
export const title = 'The SBI Structural Model';
export const slug = 'timing-is-everything';
export const objectives = [
	'Understand the three components of the SBI feedback model: Situation, Behavior, and Impact',
	'Distinguish between observable behavior and subjective assumptions when giving feedback',
	'Apply the SBI model to both corrective and positive reinforcement scenarios'
];
export const voicePromptTemplate = `You are Jamie, the podcast host. You just finished explaining the SBI feedback model with your co-host Alex. Now turn to the learner and have a brief Socratic conversation to check their understanding. Reference their role as a {{user.role}} managing {{user.team_size}} people. Ask them to construct an SBI statement for a recent situation they faced with a team member.`;
export const quiz: QuizQuestion[] = [
	{
		type: 'multiple-choice',
		question: 'What does "SBI" stand for in the SBI feedback model?',
		options: [
			'Summary, Background, Insight',
			'Situation, Behavior, Impact',
			'Strengths, Blind spots, Improvements',
			'Specifics, Balance, Intent'
		],
		correct: 1
	},
	{
		type: 'fill-in-the-blank',
		question:
			'The SBI model has three steps: first, define the 1. _____ (the where and when), then describe the observable 2. _____ (what you saw or heard), and finally explain the 3. _____ (why it matters).',
		wordBank: ['Situation', 'Behavior', 'Impact'],
		blanks: ['Situation', 'Behavior', 'Impact']
	},
	{
		type: 'true-false',
		question:
			'Saying "you were being rude" is an example of describing observable behavior in the SBI model.',
		correctBool: false,
		explanation:
			'"You were being rude" is a subjective assumption, not an observable behavior. An observable behavior would be something like "you interrupted your colleague three times during the meeting."'
	},
	{
		type: 'matching',
		question: 'Match each SBI component to the correct example.',
		leftItems: ['Situation', 'Behavior', 'Impact'],
		rightItems: [
			'You interrupted others mid-sentence during the discussion.',
			'In our team meeting on Tuesday...',
			'It made the newer team members hesitant to share their ideas.'
		],
		correctPairs: [1, 0, 2]
	},
	{
		type: 'multiple-choice',
		question:
			'According to the episode, why do words like "always" and "never" make feedback ineffective?',
		options: [
			'They are grammatically incorrect in professional settings',
			'They feel like an attack on character and immediately trigger defensiveness',
			'They are too vague for the associate to act on',
			'They only apply to negative feedback, not positive'
		],
		correct: 1
	}
];
