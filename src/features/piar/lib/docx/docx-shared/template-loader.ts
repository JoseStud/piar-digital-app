/**
 * Loads a DOCX template source into a runtime JSZip archive.
 *
 * Sources can come from same-origin URLs or trusted byte payloads.
 */

import JSZip from 'jszip';
import { instrumentDocxTemplateDocumentXml } from './template-document';
import type { PIARDocxTemplateSource } from './template-source';

/** Plans how to obtain and cache a runtime DOCX template source. */
interface TemplateLoadPlan {
  cacheKey: string | null;
  missingDocumentLabel: string;
  getSourceBytes: () => Promise<Uint8Array>;
}

const runtimeTemplateBytesByKey = new Map<string, Uint8Array>();

function copyTemplateBytes(bytes: ArrayBuffer | ArrayBufferView): Uint8Array {
  if (ArrayBuffer.isView(bytes)) {
    return new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength).slice();
  }

  return new Uint8Array(bytes).slice();
}

function resolveSameOriginTemplateUrl(url: string): string {
  const baseUrl = globalThis.location?.href;
  if (!baseUrl) {
    throw new Error('Trusted DOCX template URL can only be loaded in a browser origin.');
  }

  const resolvedUrl = new URL(url, baseUrl);
  if (resolvedUrl.origin !== globalThis.location.origin) {
    throw new Error('Trusted DOCX template URL must be same-origin.');
  }

  return resolvedUrl.href;
}

async function fetchTrustedTemplateBytes(url: string): Promise<Uint8Array> {
  const response = await fetch(url, { credentials: 'same-origin' });
  if (!response.ok) {
    throw new Error(`Failed to load DOCX template from ${url}.`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

function createTemplateLoadPlan(templateSource?: PIARDocxTemplateSource): TemplateLoadPlan {
  if (!templateSource) {
    throw new Error('No DOCX template source configured. Provide a same-origin URL or trusted template bytes.');
  }

  if (templateSource.kind === 'url') {
    const templateUrl = resolveSameOriginTemplateUrl(templateSource.url);
    return {
      cacheKey: `url:${templateUrl}`,
      missingDocumentLabel: 'trusted URL',
      getSourceBytes: async () => fetchTrustedTemplateBytes(templateUrl),
    };
  }

  return {
    cacheKey: null,
    missingDocumentLabel: 'trusted byte payload',
    getSourceBytes: async () => copyTemplateBytes(templateSource.bytes),
  };
}

async function instrumentRuntimeTemplateBytes(plan: TemplateLoadPlan): Promise<Uint8Array> {
  const sourceZip = await JSZip.loadAsync(await plan.getSourceBytes());
  const templateDocument = await sourceZip.file('word/document.xml')?.async('string');
  if (!templateDocument) {
    throw new Error(`Missing ${plan.missingDocumentLabel} DOCX template document.xml`);
  }

  sourceZip.file('word/document.xml', instrumentDocxTemplateDocumentXml(templateDocument));
  return sourceZip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
}

async function loadRuntimeTemplateBytes(plan: TemplateLoadPlan): Promise<Uint8Array> {
  if (!plan.cacheKey) {
    return instrumentRuntimeTemplateBytes(plan);
  }

  let runtimeTemplateBytes = runtimeTemplateBytesByKey.get(plan.cacheKey);
  if (!runtimeTemplateBytes) {
    runtimeTemplateBytes = await instrumentRuntimeTemplateBytes(plan);
    runtimeTemplateBytesByKey.set(plan.cacheKey, runtimeTemplateBytes);
  }

  return runtimeTemplateBytes.slice();
}

/** Loads the DOCX template archive, instrumented and ready for export. */
export async function loadRuntimeTemplateZip(templateSource?: PIARDocxTemplateSource): Promise<JSZip> {
  const plan = createTemplateLoadPlan(templateSource);
  const templateBytes = await loadRuntimeTemplateBytes(plan);

  try {
    return await JSZip.loadAsync(templateBytes);
  } catch (error) {
    if (plan.cacheKey) {
      runtimeTemplateBytesByKey.delete(plan.cacheKey);
    }
    throw error;
  }
}
