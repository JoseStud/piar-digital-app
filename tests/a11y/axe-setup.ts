/** Shared axe matcher setup for accessibility tests. */
import { render, type RenderResult } from '@testing-library/react';
import { expect } from 'vitest';
import type { ReactElement } from 'react';

type AxeResults = {
  violations: Array<{
    id: string;
    help: string;
    nodes: Array<{
      html: string;
      target: string[];
    }>;
  }>;
};

type AxeRunner = (container: HTMLElement) => Promise<AxeResults>;
const axeOptions = {
  resultTypes: ['violations'] as const,
  rules: {
    'color-contrast': { enabled: false },
  },
};

declare module 'vitest' {
  interface Assertion<T = any> {
    toHaveNoViolations(): void;
  }
}

async function loadAxeTools(): Promise<{
  axe: AxeRunner;
}> {
  try {
    const vitestAxeModule = 'vitest-axe';
    const vitestAxeMatchersModule = 'vitest-axe/matchers';
    const vitestAxe = await import(vitestAxeModule);
    const matchers = await import(vitestAxeMatchersModule);
    expect.extend(matchers);
    return {
      axe: ((container: HTMLElement) => vitestAxe.axe(container, axeOptions)) as AxeRunner,
    };
  } catch {
    const axeCore = await import('axe-core');
    const axe = async (container: HTMLElement) => {
      const runner = (axeCore.default ?? axeCore) as {
        run: (context: Element, options?: Record<string, unknown>) => Promise<AxeResults>;
      };
      return runner.run(container, axeOptions);
    };

    const toHaveNoViolations = (received: AxeResults) => ({
      pass: received.violations.length === 0,
      message: () => {
        const lines = received.violations.map((violation) => {
          const targets = violation.nodes.map((node) => node.target.join(' ')).join(', ');
          return `${violation.id}: ${targets}`;
        });
        return lines.length > 0
          ? `Expected no accessibility violations, but found:\n${lines.join('\n')}`
          : 'Expected no accessibility violations.';
      },
    });

    expect.extend({ toHaveNoViolations });
    return { axe };
  }
}

const axeToolsPromise = loadAxeTools();

export async function renderAndCheck(ui: ReactElement): Promise<RenderResult> {
  const { axe } = await axeToolsPromise;
  const result = render(ui);
  const axeResults = await axe(result.container);
  expect(axeResults).toHaveNoViolations();
  return result;
}
