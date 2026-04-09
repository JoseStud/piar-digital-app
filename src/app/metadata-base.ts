const FALLBACK_METADATA_BASE = 'https://piar.plus';

/** Normalizes the public site URL so metadata generation never crashes on blank env vars. */
export function resolveMetadataBase(siteUrl: string | undefined): URL {
  const normalizedSiteUrl = siteUrl?.trim();

  if (!normalizedSiteUrl) {
    return new URL(FALLBACK_METADATA_BASE);
  }

  try {
    return new URL(normalizedSiteUrl);
  } catch {
    return new URL(FALLBACK_METADATA_BASE);
  }
}
