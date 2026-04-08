/** Type declarations for the Tauri runtime bridge surfaced to the web side via `desktop-runtime.ts`. */
declare global {
  interface Window {
    __TAURI__?: {
      core?: {
        invoke?: <T>(command: string, args?: Record<string, unknown>) => Promise<T>;
      };
      invoke?: <T>(command: string, args?: Record<string, unknown>) => Promise<T>;
    };
  }
}

export {};
