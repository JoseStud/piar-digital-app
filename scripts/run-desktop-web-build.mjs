/**
 * Wrapper around `next build` used by the Tauri desktop pipeline. Sets
 * the env vars Tauri needs and forwards stdout/stderr.
 */
import { spawnSync } from 'node:child_process';

const isWindows = process.platform === 'win32';
const npmCommand = isWindows ? 'cmd.exe' : 'npm';
const npmArgs = isWindows ? ['/d', '/s', '/c', 'npm run build'] : ['run', 'build'];

const result = spawnSync(npmCommand, npmArgs, {
  stdio: 'inherit',
  env: {
    ...process.env,
    NEXT_PUBLIC_SITE_URL: 'https://offline.example.test',
    NEXT_PUBLIC_CONTACT_EMAIL: 'soporte@example.test',
  },
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
