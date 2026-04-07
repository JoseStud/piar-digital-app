import { invokeDesktopCommand, isDesktopOfflineApp } from '@piar-digital-app/shared/lib/desktop-runtime';

interface SaveBinaryFileOptions {
  bytes: Uint8Array;
  fileName: string;
  mimeType: string;
  fileTypeLabel: string;
  extensions: string[];
}

function normalizeExtensions(extensions: readonly string[]): string[] {
  return extensions
    .map((extension) => extension.trim().replace(/^\./, '').toLowerCase())
    .filter((extension) => extension.length > 0);
}

async function saveWithBrowserDownload({ bytes, fileName, mimeType }: SaveBinaryFileOptions): Promise<void> {
  const blob = new Blob([bytes as BlobPart], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.hidden = true;

  document.body.appendChild(link);

  try {
    link.click();
  } finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}

export async function saveBinaryFile(options: SaveBinaryFileOptions): Promise<void> {
  if (isDesktopOfflineApp()) {
    await invokeDesktopCommand<boolean>('save_binary_file', {
      bytes: Array.from(options.bytes),
      suggestedName: options.fileName,
      fileTypeLabel: options.fileTypeLabel,
      extensions: normalizeExtensions(options.extensions),
    });
    return;
  }

  await saveWithBrowserDownload(options);
}
