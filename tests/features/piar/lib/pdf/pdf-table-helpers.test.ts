import { describe, it, expect } from 'vitest';
import { wrapText } from '@/features/piar/lib/pdf/pdf-table-helpers';

describe('wrapText', () => {
  const measureWidth = (text: string) => text.length * 7;

  it('returns single line when text fits', () => {
    const lines = wrapText('Hello', 100, measureWidth);
    expect(lines).toEqual(['Hello']);
  });

  it('wraps long text into multiple lines', () => {
    const lines = wrapText('Hello World Test', 35, measureWidth);
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines) {
      expect(measureWidth(line)).toBeLessThanOrEqual(35);
    }
  });

  it('handles empty string', () => {
    const lines = wrapText('', 100, measureWidth);
    expect(lines).toEqual(['']);
  });

  it('preserves explicit newlines', () => {
    const lines = wrapText('Line1\nLine2', 200, measureWidth);
    expect(lines).toEqual(['Line1', 'Line2']);
  });

  it('handles single word wider than maxWidth', () => {
    const lines = wrapText('Superlongword', 35, measureWidth);
    expect(lines.length).toBeGreaterThan(1);
    for (const line of lines) {
      expect(measureWidth(line)).toBeLessThanOrEqual(35);
    }
  });
});
