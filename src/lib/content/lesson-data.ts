import type { QuizQuestion } from '$lib/types';

export interface LessonContent {
	partNumber: number;
	slug: string;
	title: string;
	objectives: string[];
	podcastFile: string;
	voicePromptTemplate: string;
	quiz: QuizQuestion[];
}

export const lessonContent: Record<string, LessonContent> = {
	'why-feedback-matters': {
		partNumber: 2,
		slug: 'why-feedback-matters',
		title: 'Why Feedback Matters',
		objectives: [
			'Understand the impact of regular feedback on team growth',
			'Recognize the cost of withholding feedback',
			'Identify personal barriers to giving feedback'
		],
		podcastFile: '/audio/02-why-feedback-matters.mp3',
		voicePromptTemplate: `You are Jordan, the podcast host. You just finished explaining why feedback matters with your co-host. Now turn to the learner and have a brief Socratic conversation to check their understanding. Reference their role as a {{user.role}} managing {{user.team_size}} people. Ask them why feedback matters specifically in their context.`,
		quiz: [
			{
				type: 'multiple-choice',
				question: 'What is the primary benefit of regular feedback?',
				options: [
					'It helps maintain authority over your team',
					'It builds trust and accelerates growth',
					'It reduces the need for formal reviews',
					'It makes documentation easier'
				],
				correct: 1
			},
			{
				type: 'multiple-choice',
				question: 'What often happens when managers avoid giving feedback?',
				options: [
					'Team members figure it out on their own',
					'Small issues compound into larger problems',
					'The team becomes more self-sufficient',
					'Performance naturally improves over time'
				],
				correct: 1
			},
			{
				type: 'freeform',
				question:
					'Think of a time when you received helpful feedback. What made it effective? How did it impact your growth?',
				evaluationHint:
					'Look for reflection on specific qualities: timeliness, specificity, care for the person. Should reference personal experience, not generic statements.'
			}
		]
	},
	'sbi-framework': {
		partNumber: 3,
		slug: 'sbi-framework',
		title: 'The SBI Framework',
		objectives: [
			'Understand the Situation-Behavior-Impact framework',
			'Apply SBI to structure feedback conversations',
			'Distinguish between observations and judgments'
		],
		podcastFile: '/audio/03-sbi-framework.mp3',
		voicePromptTemplate: `You are Jordan, the podcast host. You just finished explaining the SBI framework with your co-host. Now turn to the learner and have a brief Socratic conversation to check their understanding. Reference their role as a {{user.role}} managing {{user.team_size}} people. Ask them to apply SBI to a real situation they've encountered.`,
		quiz: [
			{
				type: 'multiple-choice',
				question: 'What does SBI stand for?',
				options: [
					'Situation, Behavior, Impact',
					'Summary, Background, Insight',
					'Specific, Brief, Immediate'
				],
				correct: 0
			},
			{
				type: 'order',
				question: 'Put these in the correct SBI order:',
				items: ['Describe the impact', 'State the situation', 'Name the behavior'],
				correct: [1, 2, 0]
			},
			{
				type: 'freeform',
				question:
					'Describe a recent situation where you could have used SBI. Write it out using the framework.',
				evaluationHint:
					'Look for clear separation of situation, behavior, and impact. Should reference a specific event, not a generalization.'
			}
		]
	},
	'timing-is-everything': {
		partNumber: 4,
		slug: 'timing-is-everything',
		title: 'Timing Is Everything',
		objectives: ['Understand when to give feedback for maximum impact'],
		podcastFile: '/audio/04-timing-is-everything.mp3',
		voicePromptTemplate: 'You are Jordan. Discuss timing of feedback with the learner.',
		quiz: [
			{
				type: 'multiple-choice',
				question: 'When is the best time to give feedback?',
				options: [
					'During annual reviews',
					'As close to the event as possible',
					'Only when asked',
					'At the end of a project'
				],
				correct: 1
			}
		]
	},
	'reading-the-room': {
		partNumber: 5,
		slug: 'reading-the-room',
		title: 'Reading the Room',
		objectives: ['Recognize emotional cues and ensure psychological safety'],
		podcastFile: '/audio/05-reading-the-room.mp3',
		voicePromptTemplate: 'You are Jordan. Discuss emotional awareness with the learner.',
		quiz: [
			{
				type: 'multiple-choice',
				question: 'What is psychological safety?',
				options: [
					'Avoiding all conflict',
					'Feeling safe to take interpersonal risks',
					'Having a private office',
					'Never receiving negative feedback'
				],
				correct: 1
			}
		]
	},
	'being-specific': {
		partNumber: 6,
		slug: 'being-specific',
		title: 'Being Specific',
		objectives: ['Use concrete observations instead of vague judgments'],
		podcastFile: '/audio/06-being-specific.mp3',
		voicePromptTemplate: 'You are Jordan. Discuss specificity in feedback with the learner.',
		quiz: [
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
		]
	},
	'hard-conversations': {
		partNumber: 7,
		slug: 'hard-conversations',
		title: 'The Hard Conversations',
		objectives: ['Deliver constructive feedback with empathy and directness'],
		podcastFile: '/audio/07-hard-conversations.mp3',
		voicePromptTemplate: 'You are Jordan. Discuss delivering difficult feedback with the learner.',
		quiz: [
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
		]
	},
	'listening-after-you-speak': {
		partNumber: 8,
		slug: 'listening-after-you-speak',
		title: 'Listening After You Speak',
		objectives: ['Practice active listening after delivering feedback'],
		podcastFile: '/audio/08-listening-after-you-speak.mp3',
		voicePromptTemplate: 'You are Jordan. Discuss active listening with the learner.',
		quiz: [
			{
				type: 'multiple-choice',
				question: 'What is the most important thing to do after giving feedback?',
				options: [
					'Move on to the next topic',
					'Listen to their response',
					'Document the conversation',
					'Ask them to sign an acknowledgment'
				],
				correct: 1
			}
		]
	},
	'making-it-actionable': {
		partNumber: 9,
		slug: 'making-it-actionable',
		title: 'Making It Actionable',
		objectives: ['Turn feedback into concrete next steps'],
		podcastFile: '/audio/09-making-it-actionable.mp3',
		voicePromptTemplate: 'You are Jordan. Discuss making feedback actionable with the learner.',
		quiz: [
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
		]
	},
	'putting-it-together': {
		partNumber: 10,
		slug: 'putting-it-together',
		title: 'Putting It All Together',
		objectives: ['Apply the complete feedback framework in a practice scenario'],
		podcastFile: '/audio/10-putting-it-together.mp3',
		voicePromptTemplate:
			'You are Jordan. Guide the learner through a comprehensive practice scenario.',
		quiz: [
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
		]
	}
};

export function getLessonContent(slug: string): LessonContent | undefined {
	return lessonContent[slug];
}
