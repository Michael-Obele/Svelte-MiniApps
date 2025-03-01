<script lang="ts">
  import RouteHead from '$lib/components/RouteHead.svelte';
  import { Button } from "@/ui/button";
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
</script>

<RouteHead
  title="Example App Usage Tracking | Svelte MiniApps"
  description="This app demonstrates how the usage tracking works. Every time you visit this app, its usage count increases by 1."
  keywords="svelte, mini apps, usage tracking, example"
  route="/example-app-usage"
/>

<div class="flex min-h-[80vh] flex-col items-center justify-center">
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle>Example App Usage Tracking</CardTitle>
      <CardDescription>
        This app demonstrates how the usage tracking works
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p class="mb-4 text-sm text-muted-foreground">
        Every time you visit this app, its usage count increases by 1. 
        This data is used to determine your favorite apps in the profile page.
      </p>
      <p class="text-sm font-medium">
        Try refreshing this page or navigating away and coming back to increase the usage count!
      </p>
    </CardContent>
    <CardFooter>
      <Button variant="outline" class="w-full" onclick={() => window.location.reload()}>
        Refresh to increment count
      </Button>
    </CardFooter>
  </Card>
</div>
