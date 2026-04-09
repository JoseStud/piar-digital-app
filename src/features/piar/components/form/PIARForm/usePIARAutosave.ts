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
export const MAX_AUTOSAVE_RETRIES = 3;

interface UsePIARAutosaveResult {
  saveState: SaveIndicatorState;
  saveMessage: string | null;
  retryCount: number;
  isRetrying: boolean;
  retrySave: () => void;
}

interface FlushSaveOptions {
  unloadRecovery?: boolean;
  allowRetry?: boolean;
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
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const dataRef = useRef(data);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const retryTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const retryCountRef = useRef(0);
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
  const clearRetryTimer = useCallback(() => {
    clearTimeout(retryTimerRef.current);
    retryTimerRef.current = undefined;
  }, []);

  const resetRetryState = useCallback(() => {
    retryCountRef.current = 0;
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  const scheduleRetry = useCallback((flushSave: () => void) => {
    const nextRetryCount = retryCountRef.current + 1;
    retryCountRef.current = nextRetryCount;
    setRetryCount(nextRetryCount);
    setIsRetrying(true);

    clearRetryTimer();

    const delay = 500 * (2 ** (nextRetryCount - 1));
    retryTimerRef.current = setTimeout(() => {
      retryTimerRef.current = undefined;
      setIsRetrying(false);
      flushSave();
    }, delay);
  }, [clearRetryTimer]);

  const flushSave = useCallback((options: FlushSaveOptions = {}) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = undefined;
    clearRetryTimer();

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
        resetRetryState();
        ProgressStore.clearUnloadRecovery();
        setSaveState('saved');
        setSaveMessage(null);
        return;
      }

      setSaveState('failed');
      setSaveMessage(result.message);
      if (options.allowRetry !== false && retryCountRef.current < MAX_AUTOSAVE_RETRIES) {
        scheduleRetry(() => {
          flushSave();
        });
        return;
      }

      setIsRetrying(false);
    };

    const queuedSave = saveQueueRef.current.then(runSave, runSave);
    saveQueueRef.current = queuedSave.catch(() => undefined);
  }, [clearRetryTimer, resetRetryState, scheduleRetry]);

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
    clearRetryTimer();
    resetRetryState();
    setSaveState('saving');
    scheduleSave();
  }, [clearRetryTimer, data, resetRetryState, scheduleSave]);

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
      clearRetryTimer();
      // why: on unmount, flush any pending debounced save synchronously.
      // We do NOT pass `unloadRecovery: true` here because unmount is
      // not a page-death scenario — the encrypted save will complete
      // normally inside the queued promise.
      flushSave({ allowRetry: false });
    };
  }, [clearRetryTimer, flushSave]);

  const retrySave = useCallback(() => {
    clearRetryTimer();
    resetRetryState();
    flushSave();
  }, [clearRetryTimer, flushSave, resetRetryState]);

  return {
    saveState,
    saveMessage,
    retryCount,
    isRetrying,
    retrySave,
  };
}
