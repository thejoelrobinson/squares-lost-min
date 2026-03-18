import type { Component } from 'svelte';

export interface ArticleModule {
	component: Component;
	readingTime: number | null;
}

// Map DB slugs to content folder names
const slugToFolder: Record<string, string> = {
	onboarding: '01-onboarding',
	'why-feedback-matters': '02-psychology-perception',
	'sbi-framework': '03-chronology-intervention',
	'timing-is-everything': '04-sbi-structural-model',
	'test-1': '05-test-1',
	'reading-the-room': '06-delivery-into-dialogue',
	'being-specific': '07-case-studies-scenarios',
	'hard-conversations': '08-cognitive-resistance',
	'listening-after-you-speak': '10-advanced-tactics'
};

const transcriptModules = import.meta.glob('/src/lib/content/lessons/*/transcript.svx');
const articleModules = import.meta.glob('/src/lib/content/lessons/*/article.svx');

// Cache Object.entries at module level
const transcriptFiles = Object.entries(transcriptModules);
const articleFiles = Object.entries(articleModules);

async function loadContent(
	slug: string,
	files: [string, () => Promise<unknown>][]
): Promise<Component | null> {
	const folder = slugToFolder[slug];
	const match = files.find(([path]) => (folder ? path.includes(folder) : path.includes(slug)));
	if (!match) return null;
	const mod = (await match[1]()) as { default: Component };
	return mod.default;
}

async function loadArticleContent(slug: string): Promise<ArticleModule | null> {
	const folder = slugToFolder[slug];
	const match = articleFiles.find(([path]) => (folder ? path.includes(folder) : path.includes(slug)));
	if (!match) return null;
	const mod = (await match[1]()) as {
		default: Component;
		readingTime?: number;
	};
	return {
		component: mod.default,
		readingTime: mod.readingTime ?? null
	};
}

export const loadLessonTranscript = (slug: string) => loadContent(slug, transcriptFiles);
export const loadLessonArticle = loadArticleContent;
