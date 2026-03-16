<script lang="ts">
	import OnboardingForm from '$lib/components/OnboardingForm.svelte';

	let { data } = $props();
</script>

<svelte:head><title>{data.existingUser ? 'Edit Profile' : 'Welcome to FeedbackLoop'}</title></svelte:head>

<div class="flex min-h-[70vh] flex-col items-center justify-center">
	<OnboardingForm existingUser={data.existingUser} />
</div>
