import { useEffect, useRef, useState, useCallback } from 'react';
import { UseFormWatch, FieldValues } from 'react-hook-form';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface UseAutosaveOptions<T extends FieldValues> {
  watch: UseFormWatch<T>;
  onSave: (data: T) => Promise<void>;
  interval?: number; // milliseconds
  enabled?: boolean;
}

export function useAutosave<T extends FieldValues>({
  watch,
  onSave,
  interval = 30000, // 30 seconds default
  enabled = true,
}: UseAutosaveOptions<T>) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const lastDataRef = useRef<string>('');

  const save = useCallback(async (data: T) => {
    // Prevent concurrent saves
    if (isSavingRef.current) {
      return;
    }

    // Check if data has changed
    const currentData = JSON.stringify(data);
    if (currentData === lastDataRef.current) {
      return;
    }

    isSavingRef.current = true;
    setSaveStatus('saving');

    try {
      await onSave(data);
      lastDataRef.current = currentData;
      setSaveStatus('saved');
      setLastSaved(new Date());
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('[Autosave] Error saving draft:', error);
      setSaveStatus('error');
      
      // Reset to idle after 3 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave]);

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Subscribe to form changes
    const subscription = watch((data) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new timeout for autosave
      timeoutRef.current = setTimeout(() => {
        save(data as T);
      }, interval);
    });

    // Cleanup
    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [watch, save, interval, enabled]);

  // Manual save function
  const saveNow = useCallback(() => {
    const data = watch();
    save(data as T);
  }, [watch, save]);

  return {
    saveStatus,
    lastSaved,
    saveNow,
  };
}
