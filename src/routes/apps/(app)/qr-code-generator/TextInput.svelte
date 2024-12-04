<script lang="ts">
  import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
  interface Props {
    inputText?: string;
  }

  let { inputText = $bindable('') }: Props = $props();
</script>

<div class="space-y-2">
  <Label for="text-input">Enter Text or URL</Label>
  <Input
    id="text-input"
    type="text"
    placeholder="Enter text or paste a URL"
    bind:value={inputText}
  />
</div>
