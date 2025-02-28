<script lang="ts">
  import { Button } from "@/ui/button";
  import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/ui/card";
</script>

<div class="flex flex-col items-center justify-center min-h-[80vh]">
  <Card class="w-full max-w-md">
    <CardHeader>
      <CardTitle>Example App Usage Tracking</CardTitle>
      <CardDescription>
        This app demonstrates how the usage tracking works
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p class="text-sm text-muted-foreground mb-4">
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
