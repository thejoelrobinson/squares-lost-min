import type { QuizQuestion, SubtitleCue } from '$lib/types';

export interface LessonContent {
	partNumber: number;
	slug: string;
	title: string;
	objectives: string[];
	podcastFile: string;
	voicePromptTemplate: string;
	quiz: QuizQuestion[];
	subtitles?: SubtitleCue[];
	coinImage?: string;
	scenarioBriefing?: string;
	jamieSystemPrompt?: string;
	scenarioEvaluationObjectives?: string[];
	jamieOpener?: string;
}

import * as psychologyPerception from './lessons/02-psychology-perception/quiz';
import { cues as psychologyPerceptionCues } from './lessons/02-psychology-perception/subtitles';
import * as chronologyIntervention from './lessons/03-chronology-intervention/quiz';
import { cues as chronologyInterventionCues } from './lessons/03-chronology-intervention/subtitles';
import * as sbiStructuralModel from './lessons/04-sbi-structural-model/quiz';
import { cues as sbiStructuralModelCues } from './lessons/04-sbi-structural-model/subtitles';
import * as deliveryIntoDialogue from './lessons/06-delivery-into-dialogue/quiz';
import * as caseStudiesScenarios from './lessons/07-case-studies-scenarios/quiz';
import * as cognitiveResistance from './lessons/08-cognitive-resistance/quiz';
import * as test1 from './lessons/05-test-1/quiz';
import * as advancedTactics from './lessons/10-advanced-tactics/quiz';

export const lessonContent: Record<string, LessonContent> = {
	'why-feedback-matters': {
		...psychologyPerception,
		podcastFile: '/audio/02-why-feedback-matters/podcast.mp3',
		subtitles: psychologyPerceptionCues,
		coinImage: '/images/coins/why-feedback-matters.png'
	},
	'sbi-framework': {
		...chronologyIntervention,
		podcastFile: '/audio/03-sbi-framework/podcast.mp3',
		subtitles: chronologyInterventionCues
	},
	'timing-is-everything': {
		...sbiStructuralModel,
		podcastFile: '/audio/04-timing-is-everything/podcast.mp3',
		subtitles: sbiStructuralModelCues
	},
	'test-1': {
		...test1,
		podcastFile: ''
	},
	'reading-the-room': {
		...deliveryIntoDialogue,
		podcastFile: '/audio/05-reading-the-room/podcast.mp3'
	},
	'being-specific': {
		...caseStudiesScenarios,
		podcastFile: '/audio/06-being-specific/podcast.mp3'
	},
	'hard-conversations': {
		...cognitiveResistance,
		podcastFile: '/audio/07-hard-conversations/podcast.mp3'
	},
	'listening-after-you-speak': {
		...advancedTactics,
		podcastFile: '/audio/08-listening-after-you-speak/podcast.mp3'
	}
};

export function getLessonContent(slug: string): LessonContent | undefined {
	return lessonContent[slug];
}
