/** Smoke test for the marketing landing → workflow route navigation. */
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiligenciarPage from '@piar-digital-app/app/diligenciar/page';
import { ProgressStore } from '@piar-digital-app/features/piar/lib/persistence/progress-store';
import {
  createEmptyPIARFormDataV2,
  PIAR_DATA_VERSION,
} from '@piar-digital-app/features/piar/model/piar';
import { installEncryptedProgressStorageMocks } from '../test-utils/encrypted-progress-storage';

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

describe('Landing and restore smoke', () => {
  beforeEach(() => {
    installEncryptedProgressStorageMocks();
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders app start and enters the form flow', async () => {
    const user = userEvent.setup();

    render(<DiligenciarPage />);

    expect(screen.getByRole('heading', { level: 1, name: 'Diligenciar PIAR' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Volver a la pagina principal' }).getAttribute('href')).toBe('/');
    expect(screen.queryByRole('link', { name: 'Política de Privacidad' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Términos de Uso' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Contacto' })).toBeNull();
    expect(screen.queryByText(/gratuito para educación inclusiva/i)).toBeNull();
    expect(screen.getByRole('button', { name: 'Comenzar PIAR Nuevo' })).toBeDefined();
    expect(screen.getByRole('button', { name: /importar docx o pdf piar generado anteriormente/i })).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'Comenzar PIAR Nuevo' }));

    expect(await screen.findByLabelText('Nombres', {}, { timeout: 5000 })).toBeDefined();
    expect(await screen.findByRole('button', { name: 'Volver' }, { timeout: 5000 })).toBeDefined();
  }, 30000);

  it('shows restore prompt and restores previously saved progress', async () => {
    const user = userEvent.setup();
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Guardado';
    await ProgressStore.save(data);

    render(<DiligenciarPage />);
    await user.click(screen.getByRole('button', { name: 'Comenzar PIAR Nuevo' }));

    expect(await screen.findByRole('dialog', { name: /progreso encontrado/i }, { timeout: 5000 })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restaurar' })).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Restaurar' }));

    expect(((await screen.findByLabelText('Nombres', {}, { timeout: 5000 })) as HTMLInputElement).value).toBe('Guardado');
    expect(screen.queryByText(/La restauración corrigió/i)).toBeNull();
  }, 30000);

  it('preserves restored progress when returning to app start before making edits', async () => {
    const user = userEvent.setup();
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Guardado';
    await ProgressStore.save(data);

    render(<DiligenciarPage />);
    await user.click(screen.getByRole('button', { name: 'Comenzar PIAR Nuevo' }));
    await user.click(await screen.findByRole('button', { name: 'Restaurar' }, { timeout: 5000 }));

    expect(((await screen.findByLabelText('Nombres', {}, { timeout: 5000 })) as HTMLInputElement).value).toBe('Guardado');

    await user.click(screen.getByRole('button', { name: 'Volver' }));

    const saved = await ProgressStore.load();
    expect(saved?.student.nombres).toBe('Guardado');

    await user.click(await screen.findByRole('button', { name: 'Comenzar PIAR Nuevo' }, { timeout: 5000 }));
    await user.click(await screen.findByRole('button', { name: 'Restaurar' }, { timeout: 5000 }));

    expect(((await screen.findByLabelText('Nombres', {}, { timeout: 5000 })) as HTMLInputElement).value).toBe('Guardado');
  }, 30000);

  it('shows a storage notice and starts a clean form when saved data is invalid', async () => {
    const user = userEvent.setup();
    const data = createEmptyPIARFormDataV2() as unknown as Record<string, unknown>;
    delete (data as { student?: unknown }).student;

    localStorageMock.setItem('piar-form-progress', JSON.stringify({
      v: PIAR_DATA_VERSION,
      data,
    }));

    render(<DiligenciarPage />);
    await user.click(screen.getByRole('button', { name: 'Comenzar PIAR Nuevo' }));

    expect(((await screen.findByLabelText('Nombres', {}, { timeout: 5000 })) as HTMLInputElement).value).toBe('');
    expect(screen.getByText(/no esta cifrado/i)).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: /progreso encontrado/i })).toBeNull();
  }, 15000);

  it('allows declining restore and starts with a clean form', async () => {
    const user = userEvent.setup();
    const data = createEmptyPIARFormDataV2();
    data.student.nombres = 'Dato anterior';
    await ProgressStore.save(data);

    render(<DiligenciarPage />);
    await user.click(screen.getByRole('button', { name: 'Comenzar PIAR Nuevo' }));
    await user.click(screen.getByRole('button', { name: 'Empezar nuevo' }));

    const nombresInput = (await screen.findByLabelText('Nombres', {}, { timeout: 5000 })) as HTMLInputElement;
    expect(nombresInput.value).toBe('');
  }, 15000);

  it('keeps the form open when returning to app start fails to save', async () => {
    const user = userEvent.setup();
    vi.spyOn(ProgressStore, 'save').mockResolvedValue({
      ok: false,
      code: 'storage_unavailable',
      message: 'El almacenamiento local no esta disponible en este navegador.',
    });

    render(<DiligenciarPage />);
    await user.click(screen.getByRole('button', { name: 'Comenzar PIAR Nuevo' }));

    fireEvent.change(await screen.findByLabelText('Nombres', {}, { timeout: 5000 }), { target: { value: 'Ana' } });
    await user.click(screen.getByRole('button', { name: 'Volver' }));

    expect(screen.getByLabelText('Nombres')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /generar docx editable/i })).toBeInTheDocument();
    expect(screen.getByText(/mantuvimos el formulario abierto/i)).toBeInTheDocument();
  }, 15000);
});
