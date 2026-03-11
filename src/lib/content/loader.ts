import type { Component } from 'svelte';

const modules = import.meta.glob('/src/lib/content/lessons/*.svx');

export async function loadLessonTranscript(slug: string): Promise<Component | null> {
	const files = Object.entries(modules);
	const match = files.find(([path]) => path.includes(slug));
	if (!match) return null;
	const mod = (await match[1]()) as { default: Component };
	return mod.default;
}
