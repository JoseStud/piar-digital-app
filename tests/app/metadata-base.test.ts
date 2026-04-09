import { describe, expect, it } from 'vitest';
import { resolveMetadataBase } from '@piar-digital-app/app/metadata-base';

describe('resolveMetadataBase', () => {
  it('returns the configured site URL when it is valid', () => {
    expect(resolveMetadataBase('https://piar.plus').href).toBe(
      'https://piar.plus/',
    );
  });

  it('falls back when the site URL env var is blank', () => {
    expect(resolveMetadataBase('').href).toBe('https://piar.plus/');
    expect(resolveMetadataBase('   ').href).toBe('https://piar.plus/');
  });

  it('falls back when the site URL env var is malformed', () => {
    expect(resolveMetadataBase('not a url').href).toBe('https://piar.plus/');
  });
});
