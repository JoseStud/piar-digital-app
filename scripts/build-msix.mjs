#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.platform !== 'win32') {
  throw new Error('scripts/build-msix.mjs only runs on Windows runners with makeappx.exe.');
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '..');
const tauriConfigPath = path.join(repoRoot, 'src-tauri', 'tauri.conf.json');
const tauriConfig = JSON.parse(await readFile(tauriConfigPath, 'utf8'));

const releaseVersion = normalizeSemver(process.env.RELEASE_VERSION ?? tauriConfig.version);
const msixVersion = `${releaseVersion}.0`;
const identityName = (process.env.MSIX_IDENTITY_NAME ?? tauriConfig.identifier).trim();
const publisher = (process.env.MSIX_PUBLISHER ?? 'CN=PIAR Digital').trim();
const displayName = (process.env.MSIX_DISPLAY_NAME ?? tauriConfig.productName).trim();
const publisherDisplayName = (process.env.MSIX_PUBLISHER_DISPLAY_NAME ?? 'PIAR Digital').trim();
const language = (process.env.MSIX_LANGUAGE ?? 'es-CO').trim();

if (!identityName) {
  throw new Error('MSIX identity name is empty. Set MSIX_IDENTITY_NAME or src-tauri/tauri.conf.json identifier.');
}

if (!publisher) {
  throw new Error('MSIX publisher is empty. Set MSIX_PUBLISHER (for example: CN=Your Publisher Name).');
}

if (!displayName) {
  throw new Error('MSIX display name is empty. Set MSIX_DISPLAY_NAME or src-tauri/tauri.conf.json productName.');
}

const releaseDir = path.join(repoRoot, 'src-tauri', 'target', 'release');
const bundleDir = path.join(releaseDir, 'bundle', 'msix');
const stagingDir = path.join(bundleDir, 'package');
const assetsDir = path.join(stagingDir, 'Assets');

await rm(stagingDir, { recursive: true, force: true });
await mkdir(assetsDir, { recursive: true });

const executableName = await resolveExecutableName(releaseDir, process.env.MSIX_EXECUTABLE);
await copyFile(path.join(releaseDir, executableName), path.join(stagingDir, executableName));
await copyRuntimeFiles(releaseDir, stagingDir);

const iconsDir = path.join(repoRoot, 'src-tauri', 'icons');
await copyRequiredAsset(iconsDir, assetsDir, 'StoreLogo.png');
await copyRequiredAsset(iconsDir, assetsDir, 'Square44x44Logo.png');
await copyRequiredAsset(iconsDir, assetsDir, 'Square150x150Logo.png');

const manifestPath = path.join(stagingDir, 'AppxManifest.xml');
await writeFile(
  manifestPath,
  buildManifest({
    identityName,
    publisher,
    msixVersion,
    displayName,
    publisherDisplayName,
    executableName,
    language,
  }),
  'utf8',
);

await mkdir(bundleDir, { recursive: true });
const outputFileName = `${slug(displayName)}-${releaseVersion}-x64.msix`;
const outputPath = path.join(bundleDir, outputFileName);
await rm(outputPath, { force: true });

const makeAppxPath = resolveMakeAppx();
const packResult = spawnSync(makeAppxPath, ['pack', '/d', stagingDir, '/p', outputPath, '/o'], { stdio: 'inherit' });

if (packResult.status !== 0) {
  throw new Error(`makeappx.exe failed with exit code ${packResult.status ?? 'unknown'}`);
}

console.log(`MSIX package generated: ${path.relative(repoRoot, outputPath)}`);

function normalizeSemver(rawVersion) {
  const value = String(rawVersion).trim();
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(value);
  if (!match) {
    throw new Error(`Unsupported version "${rawVersion}". Expected x.y.z or vx.y.z.`);
  }
  return `${match[1]}.${match[2]}.${match[3]}`;
}

async function resolveExecutableName(targetDir, preferredExecutable) {
  if (preferredExecutable && preferredExecutable.trim()) {
    const trimmed = preferredExecutable.trim();
    const preferredPath = path.join(targetDir, trimmed);
    if (!existsSync(preferredPath)) {
      throw new Error(`MSIX_EXECUTABLE points to "${trimmed}", but ${preferredPath} was not found.`);
    }
    return trimmed;
  }

  const entries = await readdir(targetDir, { withFileTypes: true });
  const candidates = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith('.exe'))
    .map((entry) => entry.name)
    .filter((name) => !name.toLowerCase().startsWith('uninstall'));

  if (candidates.length === 0) {
    throw new Error(`No .exe file found in ${targetDir}. Run "tauri build --no-bundle" before packaging MSIX.`);
  }

  if (candidates.length === 1) {
    return candidates[0];
  }

  const defaultCandidate = candidates.find((name) => name === 'piar_digital_offline.exe');
  if (defaultCandidate) {
    return defaultCandidate;
  }

  const withTimes = await Promise.all(
    candidates.map(async (name) => ({
      name,
      mtimeMs: (await stat(path.join(targetDir, name))).mtimeMs,
    })),
  );

  withTimes.sort((left, right) => right.mtimeMs - left.mtimeMs);
  return withTimes[0].name;
}

async function copyRuntimeFiles(sourceDir, destinationDir) {
  const runtimeExtensions = new Set(['.dll', '.pak', '.dat', '.bin']);
  const entries = await readdir(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    const extension = path.extname(entry.name).toLowerCase();
    if (!runtimeExtensions.has(extension)) {
      continue;
    }

    await copyFile(path.join(sourceDir, entry.name), path.join(destinationDir, entry.name));
  }
}

async function copyRequiredAsset(sourceDir, destinationDir, fileName) {
  const sourcePath = path.join(sourceDir, fileName);
  if (!existsSync(sourcePath)) {
    throw new Error(`Required MSIX asset is missing: ${sourcePath}`);
  }
  await copyFile(sourcePath, path.join(destinationDir, fileName));
}

function resolveMakeAppx() {
  const whereResult = spawnSync('where', ['makeappx.exe'], { encoding: 'utf8' });
  if (whereResult.status === 0) {
    const firstPath = whereResult.stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find(Boolean);

    if (firstPath) {
      return firstPath;
    }
  }

  const defaultInstallPath = path.join('C:\\', 'Program Files (x86)', 'Windows Kits', '10', 'bin', 'x64', 'makeappx.exe');
  if (existsSync(defaultInstallPath)) {
    return defaultInstallPath;
  }

  throw new Error('makeappx.exe was not found. Install the Windows 10/11 SDK on the build runner.');
}

function buildManifest({
  identityName,
  publisher,
  msixVersion,
  displayName,
  publisherDisplayName,
  executableName,
  language,
}) {
  return `<?xml version="1.0" encoding="utf-8"?>
<Package
  xmlns="http://schemas.microsoft.com/appx/manifest/foundation/windows10"
  xmlns:uap="http://schemas.microsoft.com/appx/manifest/uap/windows10"
  xmlns:rescap="http://schemas.microsoft.com/appx/manifest/foundation/windows10/restrictedcapabilities"
  IgnorableNamespaces="uap rescap">
  <Identity Name="${escapeXml(identityName)}" Publisher="${escapeXml(publisher)}" Version="${escapeXml(msixVersion)}" ProcessorArchitecture="x64" />
  <Properties>
    <DisplayName>${escapeXml(displayName)}</DisplayName>
    <PublisherDisplayName>${escapeXml(publisherDisplayName)}</PublisherDisplayName>
    <Description>${escapeXml(displayName)}</Description>
    <Logo>Assets\\StoreLogo.png</Logo>
  </Properties>
  <Resources>
    <Resource Language="${escapeXml(language)}" />
  </Resources>
  <Dependencies>
    <TargetDeviceFamily Name="Windows.Desktop" MinVersion="10.0.17763.0" MaxVersionTested="10.0.22631.0" />
  </Dependencies>
  <Applications>
    <Application Id="App" Executable="${escapeXml(executableName)}" EntryPoint="Windows.FullTrustApplication">
      <uap:VisualElements
        DisplayName="${escapeXml(displayName)}"
        Description="${escapeXml(displayName)}"
        BackgroundColor="transparent"
        Square44x44Logo="Assets\\Square44x44Logo.png"
        Square150x150Logo="Assets\\Square150x150Logo.png" />
    </Application>
  </Applications>
  <Capabilities>
    <rescap:Capability Name="runFullTrust" />
  </Capabilities>
</Package>
`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function slug(value) {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalized || 'piar-digital';
}
