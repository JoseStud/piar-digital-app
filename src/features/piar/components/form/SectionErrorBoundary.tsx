/**
 * Lightweight error boundary for a single PIAR form section.
 *
 * A failed section should not take down the entire workflow. This
 * boundary isolates render-phase failures to the section that threw and
 * gives the user a compact retry affordance.
 */
'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@piar-digital-app/shared/ui/Button';

interface SectionErrorBoundaryProps {
  children: ReactNode;
  sectionTitle: string;
}

interface SectionErrorBoundaryState {
  hasError: boolean;
}

export class SectionErrorBoundary extends Component<
  SectionErrorBoundaryProps,
  SectionErrorBoundaryState
> {
  constructor(props: SectionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): SectionErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(`SectionErrorBoundary caught error in "${this.props.sectionTitle}"`, error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="rounded-xl border border-error/20 bg-error-container p-4 md:p-5"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-error px-3 py-1 text-sm text-on-error">
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.8" />
              <path d="M10 5.8v5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="10" cy="13.9" r="1" fill="currentColor" />
            </svg>
            Error en la sección
          </div>
          <h3 className="mt-3 text-base font-semibold text-on-error-container">
            Error en la sección: {this.props.sectionTitle}
          </h3>
          <p className="mt-2 text-sm text-on-error-container">
            Esta sección tuvo un error. Las demás secciones siguen disponibles.
          </p>
          <div className="mt-4">
            <Button
              onClick={() => this.setState({ hasError: false })}
              variant="ghost"
              className="bg-error-container text-on-error-container"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
                <path d="M14.5 5.5A6 6 0 1 0 16 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M14.5 2v3.5H11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Reintentar
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
