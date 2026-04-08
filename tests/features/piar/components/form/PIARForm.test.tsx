import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PIARForm } from '@piar-digital-app/features/piar/components/form/PIARForm';
import { ProgressStore } from '@piar-digital-app/features/piar/lib/persistence/progress-store';
import { createEmptyPIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { installEncryptedProgressStorageMocks } from '../../../../test-utils/encrypted-progress-storage';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();
Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock });

describe('PIARForm', () => {
  beforeEach(() => {
    installEncryptedProgressStorageMocks();
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
    cleanup();
  });

  it('renders all section headers', () => {
    render(<PIARForm />);
    expect(screen.getAllByText('Información General').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Datos del Estudiante').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Entorno Salud').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Entorno Hogar').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Entorno Educativo').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Ajustes Razonables').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Firmas').length).toBeGreaterThan(0);
  });

  it('accepts initial data prop', () => {
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Test';
    data.student.apellidos = 'Student';
    render(<PIARForm initialData={data} />);

    const input = screen.getByDisplayValue('Test');
    expect(input).toBeDefined();
  });

  it('calls onDataChange when a field is edited', async () => {
    const onDataChange = vi.fn();
    const user = userEvent.setup();
    render(<PIARForm onDataChange={onDataChange} />);

    const nombresLabel = screen.getByText('Nombres');
    const nombresInput = nombresLabel.parentElement?.querySelector('input');
    expect(nombresInput).not.toBeNull();

    await user.type(nombresInput!, 'A');
    expect(onDataChange).toHaveBeenCalled();
  });

  it('flushes pending changes when unmounted', async () => {
    const { unmount } = render(<PIARForm />);
    fireEvent.change(screen.getByLabelText('Nombres'), { target: { value: 'Ana' } });

    unmount();

    await waitFor(async () => {
      const saved = await ProgressStore.load();
      expect(saved?.student?.nombres).toBe('Ana');
    });
  });

  it('flushes pending changes on pagehide', async () => {
    render(<PIARForm />);
    fireEvent.change(screen.getByLabelText('Nombres'), { target: { value: 'Luis' } });

    window.dispatchEvent(new Event('pagehide'));

    await waitFor(async () => {
      const saved = await ProgressStore.load();
      expect(saved?.student?.nombres).toBe('Luis');
    });
  });

  it('flushes pending changes when the document becomes hidden', async () => {
    render(<PIARForm />);
    fireEvent.change(screen.getByLabelText('Nombres'), { target: { value: 'Marta' } });

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });
    document.dispatchEvent(new Event('visibilitychange'));

    await waitFor(async () => {
      const saved = await ProgressStore.load();
      expect(saved?.student?.nombres).toBe('Marta');
    });
  });

  it('shows a non-blocking save error with retry guidance when storage write fails', async () => {
    vi.spyOn(ProgressStore, 'save').mockResolvedValueOnce({
      ok: false,
      code: 'storage_unavailable',
      message: 'El almacenamiento local no esta disponible en este navegador.',
    });

    render(<PIARForm />);
    fireEvent.change(screen.getByLabelText('Nombres'), { target: { value: 'Marta' } });
    window.dispatchEvent(new Event('pagehide'));

    expect(await screen.findByText('Error al guardar')).toBeDefined();
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeDefined();
    expect(screen.getByText('Puede exportar un DOCX o PDF desde la sección inferior antes de salir.')).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Exportar respaldo JSON' })).toBeNull();
  });
});
