<script lang="ts">
    import RouteHead from '$lib/components/RouteHead.svelte';
    import { Button } from "@/ui/button";
    import { Card } from "@/ui/card";
</script>

<RouteHead
    title="Social Links - Svelte MiniApps"
    description="Share your social media links with a QR code"
    keywords="social links, QR code, share, profile"
    route="/social-links"
/>

<div class="container mx-auto px-4 py-8">
    <Card class="mx-auto max-w-2xl">
        <div class="space-y-6 p-6">
            <div class="space-y-2 text-center">
                <h1 class="text-3xl font-bold tracking-tight">Social Links</h1>
                <p class="text-muted-foreground">Share all your social media profiles with a single QR code</p>
            </div>

            <div class="space-y-4">
                <p class="text-center">
                    Create your social links page using our 
                    <a 
                        href="/apps/qr-code-generator" 
                        class="font-medium text-primary hover:underline"
                    >
                        QR Code Generator
                    </a>
                </p>

                <div class="flex justify-center">
                    <Button variant="default" href="/apps/qr-code-generator">
                        Create Your Links Page
                    </Button>
                </div>
            </div>

            <div class="border-t pt-6">
                <h2 class="mb-4 text-xl font-semibold">Features:</h2>
                <ul class="list-inside list-disc space-y-2 text-muted-foreground">
                    <li>Create a custom page with all your social media links</li>
                    <li>Generate a QR code that links to your social media hub</li>
                    <li>Share your QR code anywhere - business cards, presentations, or social media</li>
                    <li>Update your links anytime without changing the QR code</li>
                </ul>
            </div>
        </div>
    </Card>
</div>
