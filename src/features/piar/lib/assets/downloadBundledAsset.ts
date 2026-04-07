import { saveBinaryFile } from '@/shared/lib/save-file';

interface DownloadBundledAssetOptions {
  assetUrl: string;
  fileName: string;
  mimeType: string;
  fileTypeLabel: string;
  extensions: string[];
}

export async function downloadBundledAsset({
  assetUrl,
  fileName,
  mimeType,
  fileTypeLabel,
  extensions,
}: DownloadBundledAssetOptions): Promise<void> {
  const response = await fetch(assetUrl);
  if (!response.ok) {
    throw new Error(`Failed to load bundled asset: ${assetUrl}`);
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  await saveBinaryFile({
    bytes,
    fileName,
    mimeType,
    fileTypeLabel,
    extensions,
  });
}
