/**
 * Autosave hook for the PIAR form.
 *
 * Strategy: every change to `data` marks the form dirty, schedules a
 * 500ms-debounced encrypted save, and bumps a version counter. Saves are
 * serialized through a promise queue so concurrent encrypts cannot race;
 * each in-flight save checks the version counter on completion and skips
 * its "saved" transition if a fresher edit has happened since it started.
 *
 * On `pagehide` and `visibilitychange→hidden` we write a synchronous
 * plaintext recovery copy via `ProgressStore.saveUnloadRecovery` BEFORE
 * queueing the encrypted save, because the page may die before the
 * encrypted save resolves. The recovery slot is cleared as soon as the
 * encrypted save catches up.
 *
 * @see ../../../lib/persistence/progress-store.ts
 * @see ../../../lib/persistence/progress-crypto.ts
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { ProgressStore } from '@piar-digital-app/features/piar/lib/persistence/progress-store';

export type SaveIndicatorState = 'idle' | 'saving' | 'saved' | 'failed';

interface UsePIARAutosaveResult {
  saveState: SaveIndicatorState;
  saveMessage: string | null;
  retrySave: () => void;
}

interface FlushSaveOptions {
  unloadRecovery?: boolean;
}

/**
 * React hook that auto-saves PIAR form data to encrypted localStorage.
 *
 * Returns a save indicator state, the latest failure message (or null),
 * and a `retrySave` function that flushes immediately. The save state
 * starts in `idle`, transitions to `saving` on the first edit, and
 * resolves to either `saved` or `failed` once the in-flight save
 * completes.
 */
export function usePIARAutosave(data: PIARFormDataV2): UsePIARAutosaveResult {
  const [saveState, setSaveState] = useState<SaveIndicatorState>('idle');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const dataRef = useRef(data);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const dirtyRef = useRef(false);
  const initializedRef = useRef(false);
  // why: monotonically increases on every edit. Each in-flight save
  // captures the version it intends to persist; if a newer edit has
  // happened by the time the save resolves, the in-flight save's
  // "saved" state transition is suppressed because it would falsely
  // mark the form clean.
  const dirtyVersionRef = useRef(0);
  // why: serializes encrypted saves through a chained promise so two
  // saves cannot race the encryption pipeline. Without this, two
  // back-to-back edits could trigger two parallel `subtle.encrypt`
  // calls and the second-to-finish would overwrite the first.
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  const flushSave = useCallback((options: FlushSaveOptions = {}) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = undefined;

    if (!dirtyRef.current) {
      return;
    }

    const dataToSave = dataRef.current;
    const versionToSave = dirtyVersionRef.current;
    if (options.unloadRecovery) {
      ProgressStore.saveUnloadRecovery(dataToSave);
    }

    const runSave = async () => {
      const result = await ProgressStore.save(dataToSave);
      // why: a fresh edit may have happened while encrypt was in flight;
      // if so, the new edit's scheduled save owns the dirty flag, not us.
      // Returning here without clearing dirtyRef lets the newer save
      // produce the final "saved" transition.
      if (dirtyVersionRef.current !== versionToSave) {
        return;
      }

      if (result.ok) {
        dirtyRef.current = false;
        ProgressStore.clearUnloadRecovery();
        setSaveState('saved');
        setSaveMessage(null);
        return;
      }

      setSaveState('failed');
      setSaveMessage(result.message);
    };

    const queuedSave = saveQueueRef.current.then(runSave, runSave);
    saveQueueRef.current = queuedSave.catch(() => undefined);
  }, []);

  const scheduleSave = useCallback(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(flushSave, 500);
  }, [flushSave]);

  useEffect(() => {
    dataRef.current = data;
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    dirtyRef.current = true;
    dirtyVersionRef.current += 1;
    setSaveState('saving');
    scheduleSave();
  }, [data, scheduleSave]);

  useEffect(() => {
    // why: the unload handler writes the unload-recovery slot
    // SYNCHRONOUSLY (via flushSave({ unloadRecovery: true })) before
    // queueing the encrypted save, because the encrypted save involves
    // Web Crypto + IndexedDB and may not finish before the page dies.
    // visibilitychange→hidden uses the same path because mobile Safari
    // fires it instead of pagehide on tab switches.
    const handlePageHide = () => {
      flushSave({ unloadRecovery: true });
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushSave({ unloadRecovery: true });
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // why: on unmount, flush any pending debounced save synchronously.
      // We do NOT pass `unloadRecovery: true` here because unmount is
      // not a page-death scenario — the encrypted save will complete
      // normally inside the queued promise.
      flushSave();
    };
  }, [flushSave]);

  const retrySave = useCallback(() => {
    flushSave();
  }, [flushSave]);

  return {
    saveState,
    saveMessage,
    retrySave,
  };
}
