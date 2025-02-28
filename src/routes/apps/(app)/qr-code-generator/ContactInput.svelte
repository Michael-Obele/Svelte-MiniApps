<script>
	import { Input } from "@/ui/input";
	import { Label } from "@/ui/label";

  let { contactInfo = $bindable({ name: '', phone: '', email: '', website: '' }) } = $props();
</script>

<div class="grid gap-4">
  <div class="space-y-2">
    <Label for="name">Full Name</Label>
    <Input
      id="name"
      type="text"
      placeholder="John Doe"
      bind:value={contactInfo.name}
    />
  </div>
  <div class="space-y-2">
    <Label for="phone">Phone Number</Label>
    <Input
      id="phone"
      type="tel"
      placeholder="+1234567890"
      bind:value={contactInfo.phone}
    />
  </div>
  <div class="space-y-2">
    <Label for="email">Email</Label>
    <Input
      id="email"
      type="email"
      placeholder="john@example.com"
      bind:value={contactInfo.email}
    />
  </div>
  <div class="space-y-2">
    <Label for="website">Website</Label>
    <Input
      id="website"
      type="url"
      placeholder="https://example.com"
      bind:value={contactInfo.website}
    />
  </div>
</div>
