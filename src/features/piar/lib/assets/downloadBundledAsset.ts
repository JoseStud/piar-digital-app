/**
 * Downloads a static asset bundled with the app using the same save-file path as form exports.
 *
 * The helper keeps bundled-template downloads consistent with the rest
 * of the app whether the code is running in Tauri or in the browser.
 *
 * @see ../../../shared/lib/save-file.ts
 */
import { saveBinaryFile } from '@piar-digital-app/shared/lib/save-file';

/** Parameters for downloading a bundled asset through the shared save flow. */
interface DownloadBundledAssetOptions {
  assetUrl: string;
  fileName: string;
  mimeType: string;
  fileTypeLabel: string;
  extensions: string[];
}

/** Fetches a bundled asset and writes it to disk through the shared save helper. */
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
