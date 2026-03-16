<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from './Button.svelte';
	import Card from './Card.svelte';

	interface ExistingUser {
		name: string;
		lastName: string;
		role: string;
		teamSize: number;
		feedbackFrequency: string;
		comfortLevel: number;
		challenges: string;
		scenario: string | null;
	}

	let { existingUser = null }: { existingUser?: ExistingUser | null } = $props();

	let currentStep = $state(1);
	const totalSteps = 7;

	// Form state — pre-populate from existing user if available
	let firstName = $state(existingUser?.name ?? '');
	let lastName = $state(existingUser?.lastName ?? '');
	let role = $state(existingUser?.role ?? '');
	let teamSize = $state(existingUser?.teamSize ?? 5);
	let feedbackFrequency = $state(existingUser?.feedbackFrequency ?? '');
	let comfortLevel = $state(existingUser?.comfortLevel ?? 3);
	let challenges = $state<string[]>(existingUser ? JSON.parse(existingUser.challenges) : []);
	let scenario = $state(existingUser?.scenario ?? '');

	// Validation
	let canContinue = $derived.by(() => {
		switch (currentStep) {
			case 1:
				return firstName.trim().length > 0 && lastName.trim().length > 0 && role.length > 0;
			case 2:
				return teamSize >= 1;
			case 3:
				return feedbackFrequency.length > 0;
			case 4:
				return comfortLevel >= 1 && comfortLevel <= 5;
			case 5:
				return challenges.length > 0;
			case 6:
				return true; // scenario is optional
			case 7:
				return true;
			default:
				return false;
		}
	});

	const frequencyOptions = [
		{ value: 'daily', label: 'Daily', description: 'I give feedback every day' },
		{ value: 'weekly', label: 'Weekly', description: 'At least once a week' },
		{ value: 'monthly', label: 'Monthly', description: 'A few times a month' },
		{ value: 'rarely', label: 'Rarely', description: 'Only when necessary' },
		{ value: 'never', label: 'Never', description: "I haven't given feedback yet" }
	];

	const challengeOptions = [
		'I avoid it',
		'People get defensive',
		"I don't know how to be specific",
		'I worry about the relationship',
		'I struggle with timing',
		'Other'
	];

	const comfortLabels = ['Very uncomfortable', 'Uncomfortable', 'Neutral', 'Comfortable', 'Very comfortable'];

	function toggleChallenge(challenge: string) {
		if (challenges.includes(challenge)) {
			challenges = challenges.filter((c) => c !== challenge);
		} else {
			challenges = [...challenges, challenge];
		}
	}

	function goToStep(step: number) {
		currentStep = step;
	}

	function next() {
		if (canContinue && currentStep < totalSteps) {
			currentStep += 1;
		}
	}

	function back() {
		if (currentStep > 1) {
			currentStep -= 1;
		}
	}

	let progressPercent = $derived(Math.round(((currentStep - 1) / (totalSteps - 1)) * 100));
</script>

<div class="w-full max-w-lg">
	<!-- Step indicator -->
	<div class="mb-8 text-center">
		<p class="mb-2 text-sm font-medium text-text-muted">Step {currentStep} of {totalSteps}</p>
		<div class="mx-auto h-2 w-full overflow-hidden rounded-full bg-surface-raised">
			<div
				class="h-full rounded-full bg-primary transition-all duration-500 ease-out"
				style="width: {progressPercent}%"
			></div>
		</div>
	</div>

	<form method="POST" use:enhance>
		<!-- Step 1: Name & Role -->
		{#if currentStep === 1}
			<Card padding="lg">
				<h2 class="mb-1 text-2xl font-bold text-text">{existingUser ? 'Update Your Profile' : 'Welcome to FeedbackLoop!'}</h2>
				<p class="mb-6 text-text-muted">{existingUser ? 'Review and update your info.' : "Let's start with some basics about you."}</p>

				<div class="space-y-4">
					<div class="grid grid-cols-2 gap-3">
						<div>
							<label for="firstName" class="mb-1 block text-sm font-medium text-text">
								First name
							</label>
							<input
								id="firstName"
								type="text"
								bind:value={firstName}
								placeholder="Joel"
								class="w-full rounded-lg border border-primary/20 bg-surface px-4 py-2.5 text-text placeholder:text-text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
							/>
						</div>
						<div>
							<label for="lastName" class="mb-1 block text-sm font-medium text-text">
								Last name
							</label>
							<input
								id="lastName"
								type="text"
								bind:value={lastName}
								placeholder="Robinson"
								class="w-full rounded-lg border border-primary/20 bg-surface px-4 py-2.5 text-text placeholder:text-text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
							/>
						</div>
					</div>

					<div>
						<label for="role" class="mb-1 block text-sm font-medium text-text">
							What's your role?
						</label>
						<select
							id="role"
							bind:value={role}
							class="w-full rounded-lg border border-primary/20 bg-surface px-4 py-2.5 text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
						>
							<option value="" disabled>Select your role</option>
							<option value="manager">Manager</option>
							<option value="team lead">Team Lead</option>
							<option value="ic">Individual Contributor</option>
							<option value="other">Other</option>
						</select>
					</div>
				</div>
			</Card>
		{/if}

		<!-- Step 2: Team Size -->
		{#if currentStep === 2}
			<Card padding="lg">
				<h2 class="mb-1 text-2xl font-bold text-text">Your Team</h2>
				<p class="mb-6 text-text-muted">How many people do you work with directly?</p>

				<div>
					<label for="teamSize" class="mb-1 block text-sm font-medium text-text">
						Team size
					</label>
					<input
						id="teamSize"
						type="number"
						bind:value={teamSize}
						min="1"
						max="100"
						class="w-full rounded-lg border border-primary/20 bg-surface px-4 py-2.5 text-text focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
					/>
					<p class="mt-1 text-sm text-text-muted">
						Include direct reports or close collaborators.
					</p>
				</div>
			</Card>
		{/if}

		<!-- Step 3: Feedback Frequency -->
		{#if currentStep === 3}
			<Card padding="lg">
				<h2 class="mb-1 text-2xl font-bold text-text">Feedback Habits</h2>
				<p class="mb-6 text-text-muted">How often do you currently give feedback?</p>

				<div class="space-y-3">
					{#each frequencyOptions as option (option.value)}
						<button
							type="button"
							onclick={() => (feedbackFrequency = option.value)}
							class="w-full rounded-xl border-2 p-4 text-left transition {feedbackFrequency === option.value
								? 'border-primary bg-primary-light/10'
								: 'border-surface-raised bg-surface hover:border-primary/30'}"
						>
							<span class="block font-medium text-text">{option.label}</span>
							<span class="block text-sm text-text-muted">{option.description}</span>
						</button>
					{/each}
				</div>
			</Card>
		{/if}

		<!-- Step 4: Comfort Level -->
		{#if currentStep === 4}
			<Card padding="lg">
				<h2 class="mb-1 text-2xl font-bold text-text">Comfort Level</h2>
				<p class="mb-6 text-text-muted">
					How comfortable are you giving constructive feedback?
				</p>

				<div class="flex flex-col items-center gap-4">
					<div class="flex gap-3">
						{#each [1, 2, 3, 4, 5] as level (level)}
							<button
								type="button"
								onclick={() => (comfortLevel = level)}
								class="flex h-12 w-12 items-center justify-center rounded-full border-2 text-lg font-bold transition {comfortLevel === level
									? 'border-primary bg-primary text-white'
									: 'border-surface-raised bg-surface text-text-muted hover:border-primary/30'}"
							>
								{level}
							</button>
						{/each}
					</div>
					<p class="text-sm font-medium text-primary">
						{comfortLabels[comfortLevel - 1]}
					</p>
				</div>
			</Card>
		{/if}

		<!-- Step 5: Challenges -->
		{#if currentStep === 5}
			<Card padding="lg">
				<h2 class="mb-1 text-2xl font-bold text-text">Biggest Challenges</h2>
				<p class="mb-6 text-text-muted">
					What makes giving feedback hard? Select all that apply.
				</p>

				<div class="space-y-3">
					{#each challengeOptions as challenge (challenge)}
						<button
							type="button"
							onclick={() => toggleChallenge(challenge)}
							class="flex w-full items-center gap-3 rounded-xl border-2 p-4 text-left transition {challenges.includes(challenge)
								? 'border-primary bg-primary-light/10'
								: 'border-surface-raised bg-surface hover:border-primary/30'}"
						>
							<span
								class="flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition {challenges.includes(challenge)
									? 'border-primary bg-primary'
									: 'border-text-muted/30'}"
							>
								{#if challenges.includes(challenge)}
									<svg class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
										<path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
									</svg>
								{/if}
							</span>
							<span class="font-medium text-text">{challenge}</span>
						</button>
					{/each}
				</div>
			</Card>
		{/if}

		<!-- Step 6: Scenario -->
		{#if currentStep === 6}
			<Card padding="lg">
				<h2 class="mb-1 text-2xl font-bold text-text">Real Scenario</h2>
				<p class="mb-6 text-text-muted">
					Optionally describe a real feedback situation you'd like to work through. We'll
					use it to personalize your learning.
				</p>

				<textarea
					bind:value={scenario}
					rows={5}
					placeholder="e.g., I need to tell a team member that their code reviews are too superficial, but they're sensitive to criticism..."
					class="w-full rounded-lg border border-primary/20 bg-surface px-4 py-2.5 text-text placeholder:text-text-muted/50 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
				></textarea>

				<p class="mt-2 text-sm text-text-muted">
					This is completely optional. You can skip this step.
				</p>
			</Card>
		{/if}

		<!-- Step 7: Review & Submit -->
		{#if currentStep === 7}
			<Card padding="lg">
				<h2 class="mb-1 text-2xl font-bold text-text">Review Your Answers</h2>
				<p class="mb-6 text-text-muted">
					Everything look right? You can go back to edit any step.
				</p>

				<div class="space-y-4">
					<div class="flex items-start justify-between rounded-lg bg-surface p-3">
						<div>
							<p class="text-sm text-text-muted">Name & Role</p>
							<p class="font-medium text-text">{firstName} {lastName} &middot; {role}</p>
						</div>
						<button type="button" onclick={() => goToStep(1)} class="text-sm text-primary hover:underline">Edit</button>
					</div>

					<div class="flex items-start justify-between rounded-lg bg-surface p-3">
						<div>
							<p class="text-sm text-text-muted">Team Size</p>
							<p class="font-medium text-text">{teamSize} {teamSize === 1 ? 'person' : 'people'}</p>
						</div>
						<button type="button" onclick={() => goToStep(2)} class="text-sm text-primary hover:underline">Edit</button>
					</div>

					<div class="flex items-start justify-between rounded-lg bg-surface p-3">
						<div>
							<p class="text-sm text-text-muted">Feedback Frequency</p>
							<p class="font-medium text-text capitalize">{feedbackFrequency}</p>
						</div>
						<button type="button" onclick={() => goToStep(3)} class="text-sm text-primary hover:underline">Edit</button>
					</div>

					<div class="flex items-start justify-between rounded-lg bg-surface p-3">
						<div>
							<p class="text-sm text-text-muted">Comfort Level</p>
							<p class="font-medium text-text">{comfortLevel}/5 &mdash; {comfortLabels[comfortLevel - 1]}</p>
						</div>
						<button type="button" onclick={() => goToStep(4)} class="text-sm text-primary hover:underline">Edit</button>
					</div>

					<div class="flex items-start justify-between rounded-lg bg-surface p-3">
						<div>
							<p class="text-sm text-text-muted">Challenges</p>
							<p class="font-medium text-text">{challenges.join(', ')}</p>
						</div>
						<button type="button" onclick={() => goToStep(5)} class="text-sm text-primary hover:underline">Edit</button>
					</div>

					{#if scenario.trim()}
						<div class="flex items-start justify-between rounded-lg bg-surface p-3">
							<div class="mr-4">
								<p class="text-sm text-text-muted">Scenario</p>
								<p class="font-medium text-text">{scenario}</p>
							</div>
							<button type="button" onclick={() => goToStep(6)} class="shrink-0 text-sm text-primary hover:underline">Edit</button>
						</div>
					{/if}
				</div>

				<!-- Hidden inputs to submit all values -->
				<input type="hidden" name="firstName" value={firstName} />
				<input type="hidden" name="lastName" value={lastName} />
				<input type="hidden" name="role" value={role} />
				<input type="hidden" name="teamSize" value={teamSize} />
				<input type="hidden" name="feedbackFrequency" value={feedbackFrequency} />
				<input type="hidden" name="comfortLevel" value={comfortLevel} />
				{#each challenges as challenge (challenge)}
					<input type="hidden" name="challenges" value={challenge} />
				{/each}
				<input type="hidden" name="scenario" value={scenario} />

				<div class="mt-6">
					<Button type="submit" size="lg" variant="primary">
						Start Learning
					</Button>
				</div>
			</Card>
		{/if}

		<!-- Navigation buttons -->
		{#if currentStep < totalSteps}
			<div class="mt-6 flex justify-between">
				{#if currentStep > 1}
					<Button variant="ghost" onclick={back}>
						Back
					</Button>
				{:else}
					<div></div>
				{/if}
				<Button variant="primary" onclick={next} disabled={!canContinue}>
					Continue
				</Button>
			</div>
		{:else}
			<div class="mt-6">
				<Button variant="ghost" onclick={back}>
					Back
				</Button>
			</div>
		{/if}
	</form>
</div>
