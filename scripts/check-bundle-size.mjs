#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { gzipSync } from 'node:zlib';

const BUNDLE_BUDGET_GZIP_BYTES = 480 * 1024;
const CHUNKS_DIR = path.join(process.cwd(), 'out', '_next', 'static', 'chunks');

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }

  return `${(kb / 1024).toFixed(2)} MB`;
}

function collectJsFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      return collectJsFiles(entryPath);
    }

    return entry.name.endsWith('.js') ? [entryPath] : [];
  });
}

function main() {
  if (!existsSync(CHUNKS_DIR) || !statSync(CHUNKS_DIR).isDirectory()) {
    throw new Error(`Missing build output at ${path.relative(process.cwd(), CHUNKS_DIR)}. Run \`npm run build\` first.`);
  }

  const files = collectJsFiles(CHUNKS_DIR).sort();
  if (files.length === 0) {
    throw new Error(`No JavaScript chunk files found under ${path.relative(process.cwd(), CHUNKS_DIR)}.`);
  }

  let totalRawBytes = 0;
  let totalGzipBytes = 0;

  console.log('chunk name | raw size | gzipped size');
  console.log('--- | --- | ---');

  for (const filePath of files) {
    const content = readFileSync(filePath);
    const rawBytes = content.byteLength;
    const gzipBytes = gzipSync(content).byteLength;

    totalRawBytes += rawBytes;
    totalGzipBytes += gzipBytes;

    console.log(`${path.relative(CHUNKS_DIR, filePath)} | ${formatBytes(rawBytes)} | ${formatBytes(gzipBytes)}`);
  }

  console.log(`total | ${formatBytes(totalRawBytes)} | ${formatBytes(totalGzipBytes)}`);
  console.log(`budget | - | ${formatBytes(BUNDLE_BUDGET_GZIP_BYTES)}`);

  if (totalGzipBytes > BUNDLE_BUDGET_GZIP_BYTES) {
    console.error(
      `Bundle size exceeded budget: ${formatBytes(totalGzipBytes)} gzipped across ${files.length} chunks, budget is ${formatBytes(BUNDLE_BUDGET_GZIP_BYTES)}.`,
    );
    process.exit(1);
  }
}

main();
