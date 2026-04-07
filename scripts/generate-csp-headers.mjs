import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const outputDir = path.join(projectRoot, 'out');
const headersTemplatePath = path.join(projectRoot, 'docker', 'headers.conf');
const generatedHeadersPath = path.join(outputDir, 'headers.conf');
const templateToken = '{{SCRIPT_HASHES}}';

const inlineScriptPattern = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
const scriptStripPattern = /<script\b[^>]*>[\s\S]*?<\/script>/gi;
const inlineStyleTagPattern = /<style\b[^>]*>[\s\S]*?<\/style>/i;
const inlineStyleAttributePattern = /\sstyle\s*=\s*(?:"[^"]*"|'[^']*')/i;

const notFoundScaffoldMarkers = [
  'next-error-h1',
  'This page could not be found.',
];

function walkFiles(directory, extension) {
  const entries = readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return walkFiles(entryPath, extension);
    }
    return entry.name.endsWith(extension) ? [entryPath] : [];
  });
}

function toRelative(filePath) {
  return path.relative(projectRoot, filePath).replaceAll(path.sep, '/');
}

function collectInlineScriptHashes(htmlFiles) {
  const hashes = new Set();

  for (const filePath of htmlFiles) {
    const html = readFileSync(filePath, 'utf8');
    for (const match of html.matchAll(inlineScriptPattern)) {
      const scriptBody = match[1];
      const hash = createHash('sha256').update(scriptBody).digest('base64');
      hashes.add(`'sha256-${hash}'`);
    }
  }

  return [...hashes].sort();
}

function validateNoInlineStyles(htmlFiles) {
  const violations = [];

  for (const filePath of htmlFiles) {
    const html = readFileSync(filePath, 'utf8');
    const sanitizedHtml = html.replace(scriptStripPattern, '');
    const reasons = [];

    if (inlineStyleTagPattern.test(sanitizedHtml)) {
      reasons.push('<style> tag');
    }
    if (inlineStyleAttributePattern.test(sanitizedHtml)) {
      reasons.push('style= attribute');
    }

    if (reasons.length > 0) {
      violations.push(`${toRelative(filePath)}: ${reasons.join(', ')}`);
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `Inline style violations detected in exported HTML:\n${violations.join('\n')}`,
    );
  }
}

function validateNoDefaultNotFoundScaffold(exportedFiles) {
  const violations = [];

  for (const filePath of exportedFiles) {
    const content = readFileSync(filePath, 'utf8');
    const matches = notFoundScaffoldMarkers.filter((marker) => content.includes(marker));

    if (matches.length > 0) {
      violations.push(`${toRelative(filePath)}: ${matches.join(', ')}`);
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `Default Next not-found scaffold detected in exported artifacts:\n${violations.join('\n')}`,
    );
  }
}

function generateHeaders(scriptHashes) {
  const template = readFileSync(headersTemplatePath, 'utf8');
  const tokenCount = template.split(templateToken).length - 1;

  if (tokenCount !== 1) {
    throw new Error(
      `Expected exactly one ${templateToken} placeholder in ${toRelative(headersTemplatePath)}, found ${tokenCount}.`,
    );
  }

  return template.replace(templateToken, scriptHashes.length > 0 ? ` ${scriptHashes.join(' ')}` : '');
}

function main() {
  if (!existsSync(outputDir) || !statSync(outputDir).isDirectory()) {
    throw new Error('Missing out/ directory. Run `next build` before generating CSP headers.');
  }

  const htmlFiles = walkFiles(outputDir, '.html');
  const htmlAndTxtFiles = [
    ...htmlFiles,
    ...walkFiles(outputDir, '.txt'),
  ];

  validateNoInlineStyles(htmlFiles);
  validateNoDefaultNotFoundScaffold(htmlAndTxtFiles);

  const scriptHashes = collectInlineScriptHashes(htmlFiles);
  const generatedHeaders = generateHeaders(scriptHashes);

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(generatedHeadersPath, generatedHeaders);

  const relativeHeadersPath = toRelative(generatedHeadersPath);
  console.log(`Generated ${relativeHeadersPath} with ${scriptHashes.length} unique script hashes.`);
}

main();
