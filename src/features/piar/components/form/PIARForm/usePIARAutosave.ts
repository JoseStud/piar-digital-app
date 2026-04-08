import { useCallback, useEffect, useRef, useState } from 'react';
import type { PIARFormDataV2 } from '@piar-digital-app/features/piar/model/piar';
import { ProgressStore } from '@piar-digital-app/features/piar/lib/persistence/progress-store';

export type SaveIndicatorState = 'idle' | 'saving' | 'saved' | 'failed';

interface UsePIARAutosaveResult {
  saveState: SaveIndicatorState;
  saveMessage: string | null;
  retrySave: () => void;
}

export function usePIARAutosave(data: PIARFormDataV2): UsePIARAutosaveResult {
  const [saveState, setSaveState] = useState<SaveIndicatorState>('idle');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const dataRef = useRef(data);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const dirtyRef = useRef(false);
  const initializedRef = useRef(false);
  const dirtyVersionRef = useRef(0);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());

  const flushSave = useCallback(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = undefined;

    if (!dirtyRef.current) {
      return;
    }

    const dataToSave = dataRef.current;
    const versionToSave = dirtyVersionRef.current;

    const runSave = async () => {
      const result = await ProgressStore.save(dataToSave);
      if (dirtyVersionRef.current !== versionToSave) {
        return;
      }

      if (result.ok) {
        dirtyRef.current = false;
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
    const handlePageHide = () => {
      flushSave();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushSave();
      }
    };

    window.addEventListener('pagehide', handlePageHide);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
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
