'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/shared/ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="my-8 rounded-xl bg-error-container p-6 text-center">
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-error px-3 py-1 text-sm text-on-error">
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.8" />
              <path d="M10 5.8v5.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="10" cy="13.9" r="1" fill="currentColor" />
            </svg>
            Error
          </div>
          <h2 className="mb-2 text-lg font-semibold font-headline text-on-error-container">Ocurrió un error inesperado</h2>
          <p className="mb-4 text-sm text-on-error-container">
            Intente recargar la página. Si el guardado local está disponible, sus cambios recientes deberían seguir en este navegador.
          </p>
          <Button
            onClick={() => window.location.reload()}
            variant="ghost"
            className="bg-error text-on-error hover:opacity-95"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-4 w-4" fill="none">
              <path d="M14.5 5.5A6 6 0 1 0 16 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <path d="M14.5 2v3.5H11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Recargar página
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
