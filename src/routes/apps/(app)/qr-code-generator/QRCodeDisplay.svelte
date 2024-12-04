<script lang="ts">
  import { Button } from '@/components/ui/button';
  import * as AlertDialog from '@/components/ui/alert-dialog';
  import { QRCodeImage } from 'svelte-qrcode-image';

  interface Props {
    inputText: string;
    saveQRCode: () => void;
  }

  let { inputText, saveQRCode }: Props = $props();
</script>

<div class="mt-6 flex flex-col items-center justify-center space-y-4">
  <AlertDialog.Root>
    <AlertDialog.Trigger>
      <div class="cursor-pointer rounded-lg border p-4 shadow-sm transition-all hover:shadow-md">
        <QRCodeImage
          text={inputText}
          displayID="qr-code-image"
          displayClass="h-64 w-64 rounded-md"
        />
      </div>
    </AlertDialog.Trigger>
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Your QR Code</AlertDialog.Title>
        <AlertDialog.Description>
          <div class="mt-4 flex justify-center">
            <QRCodeImage
              text={inputText}
              displayClass="h-96 w-96 rounded-md"
            />
          </div>
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel>Close</AlertDialog.Cancel>
        <Button onclick={saveQRCode} variant="default">
          Download
        </Button>
      </AlertDialog.Footer>
    </AlertDialog.Content>
  </AlertDialog.Root>

  <Button
    onclick={saveQRCode}
    size="lg"
    class="w-full max-w-sm"
  >
    Download QR Code
  </Button>
</div>
