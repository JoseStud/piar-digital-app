/** Shared helpers for DOCX tests: ZIP loading, control walking, golden file utilities. */
import JSZip from 'jszip';

export async function readZipText(zip: JSZip, path: string): Promise<string> {
  const file = zip.file(path);
  if (!file) {
    throw new Error(`Missing DOCX entry: ${path}`);
  }

  return file.async('string');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function replaceOnce(source: string, pattern: RegExp, replacement: string): string {
  if (!pattern.test(source)) {
    throw new Error(`Pattern not found: ${pattern.source}`);
  }

  pattern.lastIndex = 0;
  return source.replace(pattern, replacement);
}

export async function setCustomXmlFieldValue(zip: JSZip, path: string, value: string): Promise<void> {
  const customXml = await readZipText(zip, 'customXml/item1.xml');
  const pattern = new RegExp(`(<piar:field path="${escapeRegExp(path)}">)([^]*?)(</piar:field>)`);
  zip.file('customXml/item1.xml', replaceOnce(customXml, pattern, `$1${value}$3`));
}

export async function setDocumentControlValue(zip: JSZip, path: string, value: string): Promise<void> {
  await setDocumentControlContent(
    zip,
    path,
    `<w:p><w:r><w:t xml:space="preserve">${escapeXml(value)}</w:t></w:r></w:p>`,
  );
}

export async function setDocumentControlContent(zip: JSZip, path: string, contentXml: string): Promise<void> {
  const documentXml = await readZipText(zip, 'word/document.xml');
  const directPattern = new RegExp(`(<w:tag w:val="${escapeRegExp(path)}"\\/>[^]*?<w:sdtContent>)([^]*?)(</w:sdtContent>)`);
  if (directPattern.test(documentXml)) {
    directPattern.lastIndex = 0;
    zip.file('word/document.xml', replaceOnce(documentXml, directPattern, `$1${contentXml}$3`));
    return;
  }

  const legacyFallbackPattern = new RegExp(
    `(<w:sdt>[^]*?<w:tag w:val=")${escapeRegExp(path)}::option::[^"]+("\\/>[^]*?<w:sdtContent>)([^]*?)(</w:sdtContent>[^]*?</w:sdt>)`,
  );
  if (legacyFallbackPattern.test(documentXml)) {
    legacyFallbackPattern.lastIndex = 0;
    zip.file('word/document.xml', replaceOnce(documentXml, legacyFallbackPattern, `$1${path}$2${contentXml}$4`));
    return;
  }

  throw new Error(`Pattern not found: ${directPattern.source}`);
}

export async function setDocumentCheckboxState(
  zip: JSZip,
  path: string,
  token: string,
  checked: boolean,
): Promise<void> {
  const documentXml = await readZipText(zip, 'word/document.xml');
  const pattern = new RegExp(
    `(<w:tag w:val="${escapeRegExp(path)}::option::${escapeRegExp(token)}"\\/>[^]*?<w14:checked w14:val=")(?:0|1)(")([^]*?<w:sdtContent>[^]*?<w:t(?: [^>]*)?>)(?:☐|☒)(</w:t>)`,
  );

  zip.file(
    'word/document.xml',
    replaceOnce(documentXml, pattern, `$1${checked ? '1' : '0'}$2$3${checked ? '☒' : '☐'}$4`),
  );
}

export function buildDocumentControlParagraphs(lines: string[]): string {
  return lines
    .map((line) => `
      <w:p>
        <w:r>
          <w:t xml:space="preserve">${escapeXml(line === '' ? ' ' : line)}</w:t>
        </w:r>
      </w:p>
    `.trim())
    .join('');
}

export function buildPartialCustomXml(path: string, value: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<piar:document xmlns:piar="urn:piar-digital:v2" v="2">
  <piar:fields>
    <piar:field path="${path}">${value}</piar:field>
  </piar:fields>
</piar:document>`;
}

export function buildPartialDocumentXml(path: string, value: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:sdt>
      <w:sdtPr>
        <w:tag w:val="${path}"/>
      </w:sdtPr>
      <w:sdtContent>
        <w:p>
          <w:r>
            <w:t xml:space="preserve">${value}</w:t>
          </w:r>
        </w:p>
      </w:sdtContent>
    </w:sdt>
  </w:body>
</w:document>`;
}
