<script>
    import { fade } from 'svelte/transition';
    import BlurInText from '$lib/components/blocks/BlurInText.svelte';
</script>

<div class="container mx-auto px-4 py-8" >
    <BlurInText>
        <h1 class="mb-8 text-center text-4xl font-bold">Changelog: Svelte 4 to Svelte 5</h1>
    </BlurInText>

    <div class="mx-auto max-w-3xl space-y-8">
        <div class="rounded-lg bg-white/10 p-6 shadow-lg">
            <h2 class="mb-4 text-2xl font-semibold">Navigation & User Experience</h2>
            <ul class="list-disc space-y-3 pl-6">
                <li>Added direct links on the home page app list, replacing the additional navigation button to the apps page for more streamlined access</li>
                <li>Introduced a personal touch with an inspiring mantra and welcoming greeting</li>
                <li>Added a new "Start Exploring" button and icon for desktop view on the home page</li>
            </ul>
        </div>

        <div class="rounded-lg bg-white/10 p-6 shadow-lg">
            <h2 class="mb-4 text-2xl font-semibold">Authentication Improvements</h2>
            <ul class="list-disc space-y-3 pl-6">
                <li>Enhanced login page with improved user experience and design</li>
                <li>Redesigned registration page for better clarity and ease of use</li>
            </ul>
        </div>

        <div class="rounded-lg bg-white/10 p-6 shadow-lg">
            <h2 class="mb-4 text-2xl font-semibold">Visual Improvements</h2>
            <ul class="list-disc space-y-3 pl-6">
                <li>Enhanced footer design and functionality</li>
                <li>Standardized font styling across the about page for better consistency</li>
                <li>Reshaped and improved button designs on the apps page</li>
            </ul>
        </div>

        <div class="rounded-lg bg-white/10 p-6 shadow-lg">
            <h2 class="mb-4 text-2xl font-semibold">Content Enhancements</h2>
            <ul class="list-disc space-y-3 pl-6">
                <li>Refined and improved text content on both the home page and about page</li>
                <li>More engaging and user-friendly content presentation</li>
            </ul>
        </div>

        <div class="rounded-lg bg-white/10 p-6 shadow-lg">
            <h2 class="mb-4 text-2xl font-semibold">Technical Updates</h2>
            <ul class="list-disc space-y-3 pl-6">
                <li>Upgraded from Svelte 4 to Svelte 5</li>
                <li>Implemented modern Svelte 5 features and best practices</li>
            </ul>
        </div>

        <p class="mt-8 text-center text-sm opacity-75">
            This changelog is continuously updated as new features and improvements are added.
        </p>
    </div>
</div>

