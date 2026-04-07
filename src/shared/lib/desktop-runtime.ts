type TauriInvokeArgs = Record<string, unknown> | undefined;
type TauriInvoke = <T>(command: string, args?: TauriInvokeArgs) => Promise<T>;

interface TauriCoreApi {
  invoke?: TauriInvoke;
}

interface TauriGlobalApi {
  core?: TauriCoreApi;
  invoke?: TauriInvoke;
}

function getTauriGlobal(): TauriGlobalApi | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.__TAURI__ ?? null;
}

export function getDesktopInvoke(): TauriInvoke | null {
  const tauri = getTauriGlobal();
  if (!tauri) {
    return null;
  }

  const invoke = tauri.core?.invoke ?? tauri.invoke;
  return typeof invoke === 'function' ? invoke : null;
}

export function isDesktopOfflineApp(): boolean {
  return getDesktopInvoke() !== null;
}

export async function invokeDesktopCommand<T>(command: string, args?: TauriInvokeArgs): Promise<T> {
  const invoke = getDesktopInvoke();
  if (!invoke) {
    throw new Error('Desktop runtime is not available.');
  }

  return invoke<T>(command, args);
}
