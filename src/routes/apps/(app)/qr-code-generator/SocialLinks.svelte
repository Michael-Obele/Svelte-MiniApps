<script>
	import { Button } from "@/components/ui/button";
  let { socialLinks = $bindable([]), addSocialLink, removeSocialLink } = $props();
  import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
</script>

<div class="space-y-4">
  {#each socialLinks as link, i}
    <div class="flex gap-4">
      <div class="flex-1 space-y-2">
        <Label for={`social-label-${i}`}>Link Label</Label>
        <Input
          id={`social-label-${i}`}
          type="text"
          placeholder="Instagram, Twitter, Portfolio, etc."
          bind:value={link.label}
        />
      </div>
      <div class="flex-1 space-y-2">
        <Label for={`social-url-${i}`}>URL</Label>
        <Input
          id={`social-url-${i}`}
          type="url"
          placeholder="https://..."
          bind:value={link.url}
        />
      </div>
      <Button
        variant="destructive"
        class={`mt-8 ${socialLinks.length === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
        disabled={socialLinks.length === 1}
        onclick={() => removeSocialLink(i)}
      >
        Remove
      </Button>
    </div>
  {/each}
  <Button variant="outline" class="w-full" onclick={addSocialLink}>
    Add Another Link
  </Button>
  <!-- {#if inputText}
     <form action="" method="POST">
       <input type="hidden" name="socialLinks" value={JSON.stringify(socialLinks)} />
       <Button variant="default" type="submit">Create Socail Links Page</Button>
     </form>
  {/if} -->
</div>
